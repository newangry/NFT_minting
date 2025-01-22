import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ROLE_KEY, SUPABASE_URL } from '@/utils/server/consts';
import {
    createPagesBrowserClient,
    User
} from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/types_db';
export const supabase = createPagesBrowserClient<Database>();
export const supabaseAdmin = createClient<Database>(
    SUPABASE_URL || '',
    SUPABASE_ROLE_KEY || ''
);