import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://rxwfohqbdrnsiwvqqfnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4d2ZvaHFiZHJuc2l3dnFxZm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTcxODUsImV4cCI6MjA4MzEzMzE4NX0.qrwBS3YOFCGQFNY3yvtD9Kue6lF3Uf8lgGb72c5qqsQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});