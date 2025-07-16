import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const DatabaseDebugPage = () => {
  const [debugResults, setDebugResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runDatabaseTests = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test 1: Check authentication
      console.log('🔍 Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      results.auth = {
        user: user ? { id: user.id, email: user.email } : null,
        error: authError
      };

      // Test 2: Check profiles table access
      console.log('🔍 Testing profiles table...');
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role')
          .limit(5);
        results.profiles = {
          data: profilesData?.length || 0,
          error: profilesError
        };
      } catch (e) {
        results.profiles = { error: e };
      }

      // Test 3: Check conversations table access
      console.log('🔍 Testing conversations table...');
      try {
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('id, user1_id, user2_id')
          .limit(5);
        results.conversations = {
          data: conversationsData?.length || 0,
          error: conversationsError
        };
      } catch (e) {
        results.conversations = { error: e };
      }

      // Test 4: Check messages table access
      console.log('🔍 Testing messages table...');
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, sender_id, receiver_id')
          .limit(5);
        results.messages = {
          data: messagesData?.length || 0,
          error: messagesError
        };
      } catch (e) {
        results.messages = { error: e };
      }

      // Test 5: Check conversation_settings table access
      console.log('🔍 Testing conversation_settings table...');
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('conversation_settings')
          .select('user_id, other_user_id, is_archived')
          .limit(5);
        results.conversation_settings = {
          data: settingsData?.length || 0,
          error: settingsError
        };
      } catch (e) {
        results.conversation_settings = { error: e };
      }

      // Test 6: Check admin RPC function
      console.log('🔍 Testing admin RPC function...');
      try {
        const testUserIds = [user?.id || '00000000-0000-0000-0000-000000000000'];
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_conversations_for_admin', {
          user_ids: testUserIds
        });
        results.admin_rpc = {
          data: rpcData?.length || 0,
          error: rpcError
        };
      } catch (e) {
        results.admin_rpc = { error: e };
      }

    } catch (error) {
      results.general_error = error;
    }

    console.log('🔍 Debug results:', results);
    setDebugResults(results);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Debug</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={runDatabaseTests}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Running Tests...' : 'Run Database Tests'}
          </button>
        </div>

        {Object.keys(debugResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Results</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(debugResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseDebugPage; 