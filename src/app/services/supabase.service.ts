import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { Observable, from, map } from 'rxjs';
import { Metadata } from '../models/supabase.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
  async isLoggedIn(){
    if((await this.supabase.auth.getSession()).data.session?.user)return true;
    return false;
  }

  async signIn(email: string, password: string) {
        const { data:user, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return user;
      }
      
  async postActivity(payload: any): Promise<any> {
    // Replace 'your-function-name' with the name of your deployed function
    const { data, error } = await this.supabase.functions.invoke('upsert-metadata-and-insert-past-activity', {
      body: payload
    });
    if (error) {
      throw error;
    }
    return data;
  }

  async fetchData() {
    try {
      const { data, error } = await this.supabase.functions.invoke('fetch-metadata-and-past-activity', {
        body: { /* Optional: Include any parameters you want to send */ },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) {
        console.error('Error invoking edge function:', error);
        return;
      }

      return data
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }
}
