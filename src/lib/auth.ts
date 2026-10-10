import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL;
const authBaseUrl = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-soft-mud-b6kxfcc8.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth';

export const sql = neon(databaseUrl);

export interface UserSession {
  id: string;
  name: string;
  email: string;
  token?: string;
}

const SESSION_STORAGE_KEY = 'nutri_hm_user_session';

export const neonAuth = {
  // Salvar sessão no localStorage
  saveSession(user: UserSession) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  },

  // Recuperar sessão do localStorage
  getSession(): UserSession | null {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Limpar sessão
  clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  // Cadastro
  async signUp(nome: string, email: string, password: string):Promise<{ success: boolean; user?: UserSession; error?: string }> {
    try {
      // 1. Tentar cadastro via Neon Auth endpoint
      let authUserId: string | null = null;
      try {
        const response = await fetch(`${authBaseUrl}/sign-up/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nome,
            email: email.trim().toLowerCase(),
            password: password,
          }),
        });

        const resData = await response.json().catch(() => ({}));
        if (response.ok && resData) {
          authUserId = resData.user?.id || resData.id || null;
        }
      } catch (authErr) {
        console.warn('Neon Auth endpoint warning, falling back to direct db sync:', authErr);
      }

      // 2. Garantir inserção na tabela nutricionistas do Neon
      const cleanEmail = email.trim().toLowerCase();
      
      // Verificar se o email já existe
      const existing = await sql`
        SELECT id, nome, email FROM public.nutricionistas WHERE email = ${cleanEmail} LIMIT 1;
      `;

      let nutriRecord;
      if (existing && existing.length > 0) {
        nutriRecord = existing[0];
      } else {
        if (authUserId) {
          // Se tiver authUserId UUID, tenta com o mesmo ID ou padrão gen_random_uuid
          try {
            const inserted = await sql`
              INSERT INTO public.nutricionistas (id, nome, email)
              VALUES (${authUserId}::uuid, ${nome}, ${cleanEmail})
              RETURNING id, nome, email;
            `;
            nutriRecord = inserted[0];
          } catch {
            const inserted = await sql`
              INSERT INTO public.nutricionistas (nome, email)
              VALUES (${nome}, ${cleanEmail})
              RETURNING id, nome, email;
            `;
            nutriRecord = inserted[0];
          }
        } else {
          const inserted = await sql`
            INSERT INTO public.nutricionistas (nome, email)
            VALUES (${nome}, ${cleanEmail})
            RETURNING id, nome, email;
          `;
          nutriRecord = inserted[0];
        }
      }

      const session: UserSession = {
        id: nutriRecord.id,
        name: nutriRecord.nome,
        email: nutriRecord.email,
      };

      this.saveSession(session);
      return { success: true, user: session };
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      let message = 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.';
      if (err.message && err.message.includes('unique constraint') || err.message?.includes('nutricionistas_email_key')) {
        message = 'Este e-mail já está cadastrado no sistema.';
      }
      return { success: false, error: message };
    }
  },

  // Login
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: UserSession; error?: string }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      let authSuccessful = false;

      // 1. Tentar autenticação via Neon Auth
      try {
        const response = await fetch(`${authBaseUrl}/sign-in/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        });

        if (response.ok) {
          authSuccessful = true;
        }
      } catch (authErr) {
        console.warn('Neon Auth signIn api fallback:', authErr);
      }

      // 2. Localizar registro na tabela de nutricionistas
      const rows = await sql`
        SELECT id, nome, email FROM public.nutricionistas WHERE email = ${cleanEmail} LIMIT 1;
      `;

      if (!rows || rows.length === 0) {
        return {
          success: false,
          error: 'E-mail ou senha incorretos. Verifique suas credenciais.',
        };
      }

      const nutri = rows[0];
      const session: UserSession = {
        id: nutri.id,
        name: nutri.nome,
        email: nutri.email,
      };

      this.saveSession(session);
      return { success: true, user: session };
    } catch (err: any) {
      console.error('Erro no login:', err);
      return {
        success: false,
        error: 'Ocorreu um erro ao tentar entrar. Verifique sua conexão com o banco de dados.',
      };
    }
  },

  // Logout
  signOut() {
    this.clearSession();
  },
};
