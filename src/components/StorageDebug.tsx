import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { testStorageAccess } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function StorageDebug() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testDatabaseCalls = async () => {
    if (!user) {
      setResults({ error: 'No authenticated user' });
      return;
    }

    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Check if get_user_conversations function exists and works
      console.log('Testing get_user_conversations function...');
      testResults.conversationsTest = {};
      
      try {
        const { data: conversationData, error: conversationError } = await supabase
          .rpc('get_user_conversations', { user_uuid: user.id });
        
        testResults.conversationsTest = {
          success: !conversationError,
          data: conversationData,
          error: conversationError,
          count: conversationData?.length || 0
        };
      } catch (err) {
        testResults.conversationsTest = {
          success: false,
          error: err,
          exception: true
        };
      }

      // Test 2: Check messages table access
      console.log('Testing messages table access...');
      testResults.messagesTest = {};
      
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .limit(1);
        
        testResults.messagesTest = {
          success: !messagesError,
          data: messagesData,
          error: messagesError,
          count: messagesData?.length || 0
        };
      } catch (err) {
        testResults.messagesTest = {
          success: false,
          error: err,
          exception: true
        };
      }

      // Test 3: Check profiles table access
      console.log('Testing profiles table access...');
      testResults.profilesTest = {};
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        testResults.profilesTest = {
          success: !profileError,
          data: profileData,
          error: profileError
        };
      } catch (err) {
        testResults.profilesTest = {
          success: false,
          error: err,
          exception: true
        };
      }

      // Test 4: Check auth session 
      console.log('Testing auth session...');
      testResults.authTest = {};
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        testResults.authTest = {
          success: !sessionError,
          hasSession: !!session,
          userId: session?.user?.id,
          error: sessionError
        };
      } catch (err) {
        testResults.authTest = {
          success: false,
          error: err,
          exception: true
        };
      }

      // Test 5: Test mark_conversation_read function
      console.log('Testing mark_conversation_read function...');
      testResults.markReadTest = {};
      
      try {
        const { error: markReadError } = await supabase
          .rpc('mark_conversation_read', { 
            user_uuid: user.id, 
            other_user_uuid: 'test-user-id' 
          });
        
        testResults.markReadTest = {
          success: !markReadError,
          error: markReadError
        };
      } catch (err) {
        testResults.markReadTest = {
          success: false,
          error: err,
          exception: true
        };
      }

      console.log('All tests completed:', testResults);
      setResults(testResults);

    } catch (error) {
      console.error('Error running tests:', error);
      setResults({ error: error });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Database Debug</h3>
        <p className="text-yellow-700">Please log in to test database functionality</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-4xl">
      <h3 className="text-lg font-medium text-blue-800 mb-4">Database Debug Tool</h3>
      
      <div className="mb-4">
        <p className="text-sm text-blue-700 mb-2">Current User: {user.email}</p>
        <p className="text-sm text-blue-700 mb-2">User ID: {user.id}</p>
        <Button 
          onClick={testDatabaseCalls} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Testing...' : 'Run Database Tests'}
        </Button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-blue-800">Test Results:</h4>
          
          {results.conversationsTest && (
            <div className="p-3 bg-white rounded border">
              <h5 className="font-medium text-sm mb-2">
                get_user_conversations: {results.conversationsTest.success ? '✅' : '❌'}
              </h5>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(results.conversationsTest, null, 2)}
              </pre>
            </div>
          )}

          {results.messagesTest && (
            <div className="p-3 bg-white rounded border">
              <h5 className="font-medium text-sm mb-2">
                Messages Table Access: {results.messagesTest.success ? '✅' : '❌'}
              </h5>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(results.messagesTest, null, 2)}
              </pre>
            </div>
          )}

          {results.profilesTest && (
            <div className="p-3 bg-white rounded border">
              <h5 className="font-medium text-sm mb-2">
                Profiles Table Access: {results.profilesTest.success ? '✅' : '❌'}
              </h5>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(results.profilesTest, null, 2)}
              </pre>
            </div>
          )}

          {results.authTest && (
            <div className="p-3 bg-white rounded border">
              <h5 className="font-medium text-sm mb-2">
                Auth Session: {results.authTest.success ? '✅' : '❌'}
              </h5>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(results.authTest, null, 2)}
              </pre>
            </div>
          )}

          {results.markReadTest && (
            <div className="p-3 bg-white rounded border">
              <h5 className="font-medium text-sm mb-2">
                mark_conversation_read: {results.markReadTest.success ? '✅' : '❌'}
              </h5>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(results.markReadTest, null, 2)}
              </pre>
            </div>
          )}

          {results.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <h5 className="font-medium text-sm mb-2 text-red-800">General Error:</h5>
              <pre className="text-xs text-red-600 overflow-auto">
                {JSON.stringify(results.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 