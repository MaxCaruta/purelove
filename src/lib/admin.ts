import { supabase, supabaseAdmin } from './supabase';
import { ChatModel, ChatConversation, AdminStats, ChatMessage, UserChatSummary } from '@/types';
import { AdminConversationUtils } from './adminUtils';

export class AdminService {
  
  // Check if user has admin privileges
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      // Check the user's role from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return profile?.role === 'admin' || profile?.role === 'super_admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Debug function to test database access
  static async testDatabaseAccess(): Promise<any> {
    try {
      const results: any = {};
      
      // Test current user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      results.auth = { 
        user: user ? { id: user.id, email: user.email } : null, 
        error: authError 
      };
      
      // Test admin profile lookup
      if (user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, role')
            .eq('id', user.id)
            .single();
          results.admin_profile = { 
            profile: profile ? { role: profile.role, name: `${profile.first_name} ${profile.last_name}` } : null, 
            error: profileError 
          };
        } catch (e) {
          results.admin_profile = { error: e };
        }
      }
      
      // Test conversations table
      try {
        const { data, error } = await supabase.from('conversations').select('id, user1_id, user2_id').limit(3);
        results.conversations = { 
          count: data?.length || 0, 
          error,
          sample: data ? data.map(c => ({ 
            id: c.id.substring(0, 8), 
            user1: c.user1_id.substring(0, 8), 
            user2: c.user2_id.substring(0, 8) 
          })) : []
        };
      } catch (e) {
        results.conversations = { error: e };
      }
      
      // Test messages table
      try {
        const { data, error } = await supabase.from('messages').select('id, sender_id, receiver_id, content').limit(3);
        results.messages = { 
          count: data?.length || 0, 
          error,
          sample: data ? data.map(m => ({ 
            id: m.id.substring(0, 8), 
            sender: m.sender_id.substring(0, 8), 
            receiver: m.receiver_id.substring(0, 8),
            content: m.content.substring(0, 30) + '...'
          })) : []
        };
      } catch (e) {
        results.messages = { error: e };
      }
      
      // Test conversation_settings table
      try {
        const { data, error } = await supabase.from('conversation_settings').select('user_id, other_user_id, is_archived').limit(3);
        results.conversation_settings = { 
          count: data?.length || 0, 
          error,
          sample: data ? data.map(s => ({ 
            user: s.user_id.substring(0, 8), 
            other: s.other_user_id.substring(0, 8), 
            archived: s.is_archived 
          })) : []
        };
      } catch (e) {
        results.conversation_settings = { error: e };
      }
      
      // Test admin RPC function
      if (user) {
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_conversations_for_admin', {
            user_ids: [user.id]
          });
          results.admin_rpc_conversations = { 
            count: rpcData?.length || 0, 
            error: rpcError,
            available: !rpcError
          };
        } catch (e) {
          results.admin_rpc_conversations = { error: e, available: false };
        }
        
        // Test admin messages RPC function
        try {
          // Use placeholder UUIDs for testing
          const testId1 = '00000000-0000-0000-0000-000000000001';
          const testId2 = '00000000-0000-0000-0000-000000000002';
          const { data: msgRpcData, error: msgRpcError } = await supabase.rpc('get_all_messages_for_admin', {
            conversation_user1_id: testId1,
            conversation_user2_id: testId2
          });
          results.admin_rpc_messages = { 
            error: msgRpcError,
            available: !msgRpcError,
            test_result: 'Function exists and can be called'
          };
        } catch (e) {
          results.admin_rpc_messages = { error: e, available: false };
        }
      }
      
      return results;
    } catch (error) {
      return { general_error: error };
    }
  }

  // Get admin dashboard statistics
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // In production, these would be real database queries
      const mockStats: AdminStats = {
        totalUsers: 1247,
        activeUsers: 89,
        totalMessages: 5432,
        flaggedConversations: 12,
        modelUsage: {
          'gpt-3.5': { name: 'GPT-3.5 Turbo', requests: 2341, tokens: 145632 },
          'gpt-4': { name: 'GPT-4', requests: 567, tokens: 89432 },
          'claude-3': { name: 'Claude 3 Sonnet', requests: 234, tokens: 34521 }
        }
      };

      return mockStats;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  // Get all available AI models
  static async getModels(): Promise<ChatModel[]> {
    try {
      const { data: models, error } = await supabase
        .from('admin_models')
        .select('*')
        .order('name');

      if (error) {
        console.error('Database error fetching models:', error);
        // Fallback to mock data if database isn't available
        return await this.getMockModels();
      }

      return models.map(model => ({
        id: model.id,
        name: model.name,
        provider: model.provider as 'openai' | 'anthropic' | 'google',
        model: model.model,
        active: model.active,
        maxTokens: model.max_tokens,
        temperature: model.temperature,
        presencePenalty: model.presence_penalty,
        frequencyPenalty: model.frequency_penalty
      }));
    } catch (error) {
      console.error('Error fetching models:', error);
      // Fallback to mock data
      return await this.getMockModels();
    }
  }

  // Fallback mock models for development
  private static async getMockModels(): Promise<ChatModel[]> {
    return [
      {
        id: 'gpt-3.5',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        active: true,
        maxTokens: 200,
        temperature: 0.8,
        presencePenalty: 0.6,
        frequencyPenalty: 0.3
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        model: 'gpt-4',
        active: false,
        maxTokens: 200,
        temperature: 0.7,
        presencePenalty: 0.5,
        frequencyPenalty: 0.2
      },
      {
        id: 'claude-3',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        active: false,
        maxTokens: 200,
        temperature: 0.8
      }
    ];
  }

  // Update model settings
  static async updateModel(modelId: string, settings: Partial<ChatModel>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (settings.maxTokens !== undefined) updateData.max_tokens = settings.maxTokens;
      if (settings.temperature !== undefined) updateData.temperature = settings.temperature;
      if (settings.presencePenalty !== undefined) updateData.presence_penalty = settings.presencePenalty;
      if (settings.frequencyPenalty !== undefined) updateData.frequency_penalty = settings.frequencyPenalty;
      if (settings.active !== undefined) updateData.active = settings.active;
      if (settings.name !== undefined) updateData.name = settings.name;
      if (settings.provider !== undefined) updateData.provider = settings.provider;
      if (settings.model !== undefined) updateData.model = settings.model;

      const { error } = await supabase
        .from('admin_models')
        .update(updateData)
        .eq('id', modelId);

      if (error) {
        console.error('Database error updating model:', error);
        // In development, continue without throwing to allow mock functionality
        console.log(`Mock update model ${modelId}:`, settings);
      }
    } catch (error) {
      console.error('Error updating model:', error);
      // In development, continue without throwing
      console.log(`Mock update model ${modelId}:`, settings);
    }
  }

  // Toggle model active status
  static async toggleModel(modelId: string): Promise<void> {
    try {
      // First get current status
      const { data: currentModel, error: fetchError } = await supabase
        .from('admin_models')
        .select('active')
        .eq('id', modelId)
        .single();

      if (fetchError) {
        console.error('Error fetching current model status:', fetchError);
        console.log(`Mock toggle model ${modelId}`);
        return;
      }

      // Toggle the active status
      const { error: updateError } = await supabase
        .from('admin_models')
        .update({ active: !currentModel.active })
        .eq('id', modelId);

      if (updateError) {
        console.error('Database error toggling model:', updateError);
        console.log(`Mock toggle model ${modelId}`);
      }
    } catch (error) {
      console.error('Error toggling model:', error);
      console.log(`Mock toggle model ${modelId}`);
    }
  }

  // Get user chats organized by users and their profile conversations
  static async getUserChats(): Promise<UserChatSummary[]> {
    try {
      console.log('🔍 [ADMIN] Starting getUserChats...');
      
      // Debug: Check current authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 [ADMIN] Current authenticated user:', { 
        id: user?.id, 
        email: user?.email,
        authError 
      });
      
      if (!user) {
        console.error('🔍 [ADMIN] No authenticated user found');
        return [];
      }
      
      // Get all users (not admin profiles) - be less restrictive
      const { data: realUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, photos, role, created_at')
        .neq('role', 'admin')
        .order('created_at', { ascending: false })
        .limit(50);

      if (usersError) {
        console.warn('Error fetching users:', usersError);
        return [];
      }

      if (!realUsers || realUsers.length === 0) {
        console.log('🔍 [ADMIN] No real users found');
        return [];
      }

      console.log('🔍 [ADMIN] Found real users:', realUsers.map(u => ({ 
        id: u.id.substring(0, 8), 
        name: `${u.first_name} ${u.last_name}`,
        role: u.role
      })));

      const userChatsMap = new Map<string, UserChatSummary>();

      // First, create entries for all users (even those without conversations)
      for (const user of realUsers) {
        userChatsMap.set(user.id, {
          user: {
            id: user.id,
            firstName: user.first_name || 'Unknown',
            lastName: user.last_name || 'User',
            email: `user-${user.id.substring(0, 8)}@app.com`, // Placeholder since email is in auth.users
            photo: user.photos && user.photos.length > 0 ? user.photos[0] : undefined
          },
          conversations: [],
          totalConversations: 0,
          lastActivity: user.created_at
        });
      }

      // Now fetch conversations for these users - try multiple approaches
      console.log('🔍 [ADMIN] Fetching conversations for users');
      
      let conversationsData: any[] = [];
      let convError: any = null;
      
      // Try approach 1: Get ALL conversations and filter client-side
      try {
        console.log('🔍 [ADMIN] Attempting to fetch all conversations...');
        const { data: allConversations, error: allError } = await supabaseAdmin
        .from('conversations')
        .select(`
          *,
          last_message:messages(content, type)
        `)
        .order('last_message_at', { ascending: false });
        
        if (allError) {
          console.log('🔍 [ADMIN] Failed to fetch all conversations:', allError);
          convError = allError;
        } else if (allConversations) {
          // Filter for conversations involving our real users
          const userIds = realUsers.map(u => u.id);
          conversationsData = allConversations.filter(conv => 
            userIds.includes(conv.user1_id) || userIds.includes(conv.user2_id)
          );
          console.log('🔍 [ADMIN] Filtered conversations:', conversationsData.length, 'out of', allConversations.length, 'total');
        }
      } catch (fetchError) {
        console.log('🔍 [ADMIN] Error fetching conversations:', fetchError);
        convError = fetchError;
      }
      
      // If that fails, try approach 2: Individual queries per user
      if ((!conversationsData || conversationsData.length === 0) && convError) {
        console.log('🔍 [ADMIN] Trying individual user queries...');
        conversationsData = [];
        
        for (const user of realUsers) {
          try {
            const { data: userConversations } = await supabaseAdmin
              .from('conversations')
              .select(`
                *,
                last_message:messages(content, type)
              `)
              .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
              .order('last_message_at', { ascending: false });
            
            if (userConversations) {
              // Avoid duplicates
              userConversations.forEach(conv => {
                if (!conversationsData.find(existing => existing.id === conv.id)) {
                  conversationsData.push(conv);
                }
              });
            }
          } catch (userError) {
            console.log(`🔍 [ADMIN] Failed to fetch conversations for user ${user.id}:`, userError);
          }
        }
        
        // Sort by last message date
        conversationsData.sort((a, b) => {
          const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return bTime - aTime;
        });
        
        convError = null; // Clear error if we got some data
      }

      console.log('🔍 [ADMIN] Conversation query error:', convError);
      console.log('🔍 [ADMIN] Raw conversations data:', conversationsData);

      if (convError) {
        console.warn('Error fetching conversations:', convError);
        return Array.from(userChatsMap.values());
      }

      console.log('🔍 [ADMIN] Found conversations:', conversationsData?.length || 0);
      if (conversationsData) {
        conversationsData.forEach((conv: any, i: number) => {
          console.log(`🔍 [ADMIN] Conversation ${i + 1}:`, {
            id: conv.id.substring(0, 8),
            user1_id: conv.user1_id.substring(0, 8),
            user2_id: conv.user2_id.substring(0, 8),
            last_message_at: conv.last_message_at
          });
        });
      }

      if (conversationsData && conversationsData.length > 0) {
        // Fetch model profiles info for better display
        const { data: modelProfiles, error: modelError } = await supabaseAdmin
          .from('profiles')
          .select('id, first_name, last_name, photos, role')
          .eq('role', 'model');

        console.log('🔍 [ADMIN] Found model profiles:', modelProfiles?.length || 0);
        if (modelProfiles) {
          modelProfiles.forEach(profile => {
            console.log(`🔍 [ADMIN] Model profile:`, {
              id: profile.id.substring(0, 8),
              name: `${profile.first_name} ${profile.last_name}`,
              role: profile.role
            });
          });
        }

        const modelProfilesMap = new Map();
        if (modelProfiles) {
          modelProfiles.forEach(profile => {
            modelProfilesMap.set(profile.id, profile);
          });
        }

        for (const conv of conversationsData) {
          console.log(`🔍 [ADMIN] Processing conversation:`, {
            id: conv.id.substring(0, 8),
            user1_id: conv.user1_id.substring(0, 8),
            user2_id: conv.user2_id.substring(0, 8)
          });
          
          // Determine which user is the regular user and which is the model
          const user1 = realUsers.find(u => u.id === conv.user1_id);
          const user2 = realUsers.find(u => u.id === conv.user2_id);
          
          console.log(`🔍 [ADMIN] User lookup:`, {
            user1Found: !!user1,
            user2Found: !!user2,
            user1Name: user1 ? `${user1.first_name} ${user1.last_name}` : 'Not found',
            user2Name: user2 ? `${user2.first_name} ${user2.last_name}` : 'Not found'
          });
          
          let regularUserId: string | null = null;
          let modelProfileId: string | null = null;
          
          // Check all possible combinations - be less restrictive
          if (user1 && !user2) {
            // user1 is a user, user2 should be a model or another user
            const otherProfile = modelProfilesMap.get(conv.user2_id);
            if (otherProfile) {
              regularUserId = user1.id;
              modelProfileId = conv.user2_id;
              console.log(`🔍 [ADMIN] Case 1: user1 is user, user2 is ${otherProfile.role}`);
            } else {
              // user2 might be another user (not a model)
              regularUserId = user1.id;
              modelProfileId = conv.user2_id;
              console.log(`🔍 [ADMIN] Case 1: user1 is user, user2 is another user (not model)`);
            }
          } else if (user2 && !user1) {
            // user2 is a user, user1 should be a model or another user
            const otherProfile = modelProfilesMap.get(conv.user1_id);
            if (otherProfile) {
              regularUserId = user2.id;
              modelProfileId = conv.user1_id;
              console.log(`🔍 [ADMIN] Case 2: user2 is user, user1 is ${otherProfile.role}`);
            } else {
              // user1 might be another user (not a model)
              regularUserId = user2.id;
              modelProfileId = conv.user1_id;
              console.log(`🔍 [ADMIN] Case 2: user2 is user, user1 is another user (not model)`);
            }
          } else if (user1 && user2) {
            // Both are users - show the conversation with user1 as the primary user
            regularUserId = user1.id;
            modelProfileId = user2.id;
            console.log(`🔍 [ADMIN] Case 3: Both are users - showing conversation between users`);
          } else {
            // Neither is a known user - skip conversations between unknown entities
            console.log(`🔍 [ADMIN] Case 4: Neither is a known user - skipping unknown conversation`);
            continue;
          }

          if (!regularUserId || !modelProfileId) {
            console.log(`🔍 [ADMIN] Missing IDs - skipping:`, { regularUserId: !!regularUserId, modelProfileId: !!modelProfileId });
            continue;
          }
          
          const userChat = userChatsMap.get(regularUserId);
          if (!userChat) {
            console.log(`🔍 [ADMIN] No userChat found for regularUserId:`, regularUserId.substring(0, 8));
            continue;
          }

          // Get profile details - could be a model or another user
          const modelProfile = modelProfilesMap.get(modelProfileId);
          let profileName: string;
          let profilePhoto: string | undefined;
          
          if (modelProfile) {
            // It's a model profile
            profileName = `${modelProfile.first_name} ${modelProfile.last_name}`;
            profilePhoto = modelProfile.photos?.[0];
            
            // Ensure Elena has the same photo as in ChatWindow
            if (modelProfile.first_name === 'Elena' && (!profilePhoto || !profilePhoto.includes('photo-1544005313-94ddf0286df2'))) {
              profilePhoto = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80';
            }
            
            console.log(`🔍 [ADMIN] Model profile: ${profileName}`);
          } else {
            // It's another user profile - fetch it
            try {
              const { data: otherUserProfile } = await supabaseAdmin
                .from('profiles')
                .select('first_name, last_name, photos')
                .eq('id', modelProfileId)
                .single();
              
              if (otherUserProfile) {
                profileName = `${otherUserProfile.first_name} ${otherUserProfile.last_name}`;
                profilePhoto = otherUserProfile.photos?.[0];
                console.log(`🔍 [ADMIN] Other user profile: ${profileName}`);
              } else {
                profileName = 'Unknown User';
                console.log(`🔍 [ADMIN] Unknown profile for ID: ${modelProfileId}`);
              }
            } catch (error) {
              profileName = 'Unknown User';
              console.log(`🔍 [ADMIN] Error fetching profile for ID: ${modelProfileId}:`, error);
            }
          }

          console.log(`🔍 [ADMIN] Adding conversation:`, {
            regularUser: userChat.user.firstName + ' ' + userChat.user.lastName,
            modelProfile: profileName,
            modelProfileId: modelProfileId.substring(0, 8)
          });

          // Calculate unread count - the unread count should be for the regular user
          let unreadCount = 0;
          if (regularUserId === conv.user1_id) {
            unreadCount = conv.user1_unread_count || 0;
          } else if (regularUserId === conv.user2_id) {
            unreadCount = conv.user2_unread_count || 0;
          }
          
          console.log(`🔍 [ADMIN] Unread count calculation:`, {
            regularUserId: regularUserId.substring(0, 8),
            convUser1: conv.user1_id.substring(0, 8),
            convUser2: conv.user2_id.substring(0, 8),
            user1Unread: conv.user1_unread_count || 0,
            user2Unread: conv.user2_unread_count || 0,
            finalUnreadCount: unreadCount
          });

          // Get the actual last message content
          let lastMessage = 'No messages yet';
          if (conv.last_message && conv.last_message.content) {
            lastMessage = conv.last_message.content;
          } else {
            // Fallback: try to fetch the latest message for this conversation
            try {
              const { data: latestMessage } = await supabaseAdmin
                .from('messages')
                .select('content')
                .or(`and(sender_id.eq.${regularUserId},receiver_id.eq.${modelProfileId}),and(sender_id.eq.${modelProfileId},receiver_id.eq.${regularUserId})`)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              if (latestMessage?.content) {
                lastMessage = latestMessage.content;
              }
            } catch (msgError) {
              console.log('Could not fetch latest message:', msgError);
            }
          }

          userChat.conversations.push({
            profileId: modelProfileId,
            profileName: profileName,
            profilePhoto: profilePhoto,
            lastMessage: lastMessage,
            lastMessageAt: conv.last_message_at || conv.updated_at,
            unreadCount: unreadCount,
            status: 'active'
          });

          userChat.totalConversations = userChat.conversations.length;
          userChat.lastActivity = conv.last_message_at || conv.updated_at || userChat.lastActivity;
        }
      }

      const result = Array.from(userChatsMap.values());
      console.log('🔍 [ADMIN] Final result:', result.map(r => ({
        user: r.user.firstName + ' ' + r.user.lastName,
        conversationCount: r.conversations.length,
        conversations: r.conversations.map(c => c.profileName)
      })));
      
      return result;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      return [];
    }
  }

  // Get conversation details
  static async getConversation(userId: string, profileId: string): Promise<ChatConversation> {
    try {
      console.log('🔍 [ADMIN] Getting conversation for:', { userId, profileId });
      
      // Determine correct user order based on ID comparison
      const [user1Id, user2Id] = userId < profileId ? [userId, profileId] : [profileId, userId];
      
      // Get or create conversation with correct user order
      const { data: existingConv, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('user1_id', user1Id)
        .eq('user2_id', user2Id)
        .single();

      let conversationId;
      
      if (convError || !existingConv) {
        // Create a new conversation with ordered user IDs
        const { data: newConv, error: createError } = await supabaseAdmin
          .from('conversations')
          .insert({
            user1_id: user1Id,
            user2_id: user2Id,
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('🔍 [ADMIN] Error creating conversation:', createError);
          throw new Error('Failed to create conversation');
        }
        
        conversationId = newConv.id;
      } else {
        conversationId = existingConv.id;
      }

      // Get user and profile data
      const [userResult, profileResult] = await Promise.all([
        supabaseAdmin.from('profiles').select('*, role').eq('id', userId).single(),
        supabaseAdmin.from('profiles').select('*, role').eq('id', profileId).single()
      ]);

      if (userResult.error || profileResult.error) {
        console.error('🔍 [ADMIN] Error fetching profiles:', { userError: userResult.error, profileError: profileResult.error });
        throw new Error('Failed to fetch user/profile data');
      }

      // Keep the original logic - userId is the real user, profileId is the model
      const realUser = userResult.data;
      const modelProfile = profileResult.data;

      console.log('🔍 [ADMIN] User assignment:', {
        realUser: { id: realUser.id, firstName: realUser.first_name, role: realUser.role },
        modelProfile: { id: modelProfile.id, firstName: modelProfile.first_name, role: modelProfile.role }
      });

      // Get messages for this conversation
      let messagesData = [];
      try {
        const { data: messages } = await supabaseAdmin
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${userId},sender_id.eq.${profileId}`)
          .or(`receiver_id.eq.${userId},receiver_id.eq.${profileId}`)
          .order('created_at', { ascending: true });

        messagesData = messages || [];
      } catch (msgError) {
        console.error('🔍 [ADMIN] Error fetching messages:', msgError);
        messagesData = [];
      }

      // Convert messages to ChatMessage format
      const messages: ChatMessage[] = messagesData.map((msg: any) => {
        const role = msg.sender_id === modelProfile.id ? 'assistant' : 'user';
        console.log('🔍 [ADMIN] Converting message to ChatMessage:', {
          messageId: msg.id,
          sender_id: msg.sender_id,
          modelProfileId: modelProfile.id,
          realUserId: realUser.id,
          role: role,
          content: msg.content?.substring(0, 30)
        });
        
        return {
          id: msg.id,
          conversationId: conversationId,
          content: msg.content,
          role: role,
          timestamp: msg.created_at,
          isAdminResponse: false,
          type: msg.type || 'text',
          imageUrl: msg.image_url,
          voiceUrl: msg.voice_url,
          duration: msg.duration
        };
      });

      // Determine conversation status
      let status: 'active' | 'archived' | 'flagged' = 'active';
      try {
        const { data: settings } = await supabaseAdmin
          .from('conversation_settings')
          .select('is_archived')
          .eq('user_id', userId)
          .eq('other_user_id', profileId)
          .single();

        if (settings?.is_archived) {
          status = 'archived';
        }
      } catch (settingsError) {
        console.log('🔍 [ADMIN] Could not fetch conversation settings:', settingsError);
      }

      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

      return {
        id: conversationId,
        userId: realUser.id,
        profileId: modelProfile.id,
        lastMessage: lastMessage?.content || 'No messages yet',
        lastMessageAt: lastMessage?.timestamp || new Date().toISOString(),
        status,
        messages,
        user: {
          id: realUser.id,
          firstName: realUser.first_name || 'Unknown',
          lastName: realUser.last_name || 'User',
          email: realUser.email || `user-${realUser.id.substring(0, 8)}@app.com`,
          photo: realUser.photos?.[0]
        },
        profile: {
          id: modelProfile.id,
          firstName: modelProfile.first_name || 'Profile',
          lastName: modelProfile.last_name || '',
          photo: modelProfile.photos?.[0],
          city: modelProfile.city || 'Unknown City',
          country: modelProfile.country || 'Unknown Country',
          profession: modelProfile.profession || 'Unknown Profession'
        }
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  // Get current user's localStorage conversations for admin view
  private static getCurrentUserLocalStorageChats(): UserChatSummary | null {
    try {
      // Debug: log all localStorage keys to see what's available
      const allKeys = Object.keys(localStorage);
      console.log('All localStorage keys:', allKeys);
      
      // Look for the correct Supabase auth session key for this project
      const correctAuthKey = 'sb-bnhvcnbsxjrgdhhxdrpa-auth-token';
      const authKeys = allKeys.filter(key => key.includes('supabase') || key.includes('auth'));
      console.log('Auth-related keys:', authKeys);
      
      let currentUser = null;
      let userId = null;
      
      // First try the correct auth key for this project
      try {
        const authData = localStorage.getItem(correctAuthKey);
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed.user && parsed.user.id) {
            currentUser = parsed.user;
            userId = parsed.user.id;
            console.log(`Found user data in correct project key: ${correctAuthKey}`, { id: userId, email: currentUser.email });
          }
        }
      } catch (e) {
        console.warn('Failed to parse correct auth key:', e);
      }
      
      // If that fails, try other auth keys
      if (!userId) {
        for (const key of authKeys) {
          if (key === correctAuthKey) continue; // Already tried this one
          try {
            const authData = localStorage.getItem(key);
            if (authData) {
              const parsed = JSON.parse(authData);
              if (parsed.user && parsed.user.id) {
                currentUser = parsed.user;
                userId = parsed.user.id;
                console.log(`Found user data in key: ${key}`, { id: userId, email: currentUser.email });
                break;
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
      
      if (!userId) {
        console.log('No current user found in localStorage auth sessions');
        return null;
      }

      const userEmail = currentUser?.email || `user-${userId.substring(0, 8)}@app.com`;
      
      console.log('Looking for conversations for user:', userId, userEmail);
      
      // Look for conversations using the ChatWindow format: conversations_${userId}
      let conversationsData: any = null;
      const conversationKey = `conversations_${userId}`;
      const stored = localStorage.getItem(conversationKey);
      
      if (!stored) {
        console.log(`No conversations found for key: ${conversationKey}`);
        
        // Debug: Check for any conversation keys that exist
        const conversationKeys = allKeys.filter(key => key.startsWith('conversations_'));
        if (conversationKeys.length > 0) {
          console.log('Found other conversation keys:', conversationKeys);
          console.log('User ID from auth:', userId);
          console.log('Expected key:', conversationKey);
          
          // Try the first conversation key we find as a fallback
          const fallbackKey = conversationKeys[0];
          const fallbackStored = localStorage.getItem(fallbackKey);
          if (fallbackStored) {
            console.log(`Using fallback conversation key: ${fallbackKey}`);
            try {
              const fallbackData = JSON.parse(fallbackStored);
              if (fallbackData && Array.isArray(fallbackData)) {
                // Update the user ID to match the fallback key
                const fallbackUserId = fallbackKey.replace('conversations_', '');
                
                // Get updated user data for the fallback user ID
                let fallbackUser = currentUser;
                for (const key of authKeys) {
                  try {
                    const authData = localStorage.getItem(key);
                    if (authData) {
                      const parsed = JSON.parse(authData);
                      if (parsed.user && parsed.user.id === fallbackUserId) {
                        fallbackUser = parsed.user;
                        break;
                      }
                    }
                  } catch (e) {
                    // Skip
                  }
                }
                
                // Process with the fallback data
                userId = fallbackUserId;
                currentUser = fallbackUser;
                conversationsData = fallbackData;
                console.log(`Successfully loaded fallback conversations for user: ${userId}`);
              }
            } catch (e) {
              console.warn('Failed to parse fallback conversation data:', e);
            }
          }
        }
        
        if (!conversationsData) {
          return null;
        }
      } else {
        try {
          conversationsData = JSON.parse(stored);
          console.log(`Found conversations in localStorage under key: ${conversationKey}`, conversationsData);
        } catch (e) {
          console.warn(`Failed to parse localStorage data for key ${conversationKey}:`, e);
          return null;
        }
      }

      if (!conversationsData || !Array.isArray(conversationsData) || conversationsData.length === 0) {
        console.log('No localStorage conversations found for current user');
        return null;
      }

      // Convert localStorage conversations to admin format
      const adminConversations = conversationsData.map(conv => {
        const lastMessage = conv.messages && conv.messages.length > 0 
          ? conv.messages[conv.messages.length - 1] 
          : null;

        return {
          profileId: conv.id,
          profileName: `${conv.profile?.firstName || 'Profile'} ${conv.profile?.lastName || ''}`.trim(),
          profilePhoto: conv.profile?.photos?.[0] || conv.profile?.photo,
          lastMessage: lastMessage?.text || conv.lastMessage || 'No messages yet',
          lastMessageAt: lastMessage?.timestamp || conv.lastMessageTime || new Date().toISOString(),
          unreadCount: conv.unreadCount || 0,
          status: 'active' as const
        };
      });

      // Get user profile data
      const userFirstName = currentUser?.user_metadata?.first_name || 
                           currentUser?.user_metadata?.firstName ||
                           currentUser?.email?.split('@')[0] || 
                           'Current User';
      
      const userLastName = currentUser?.user_metadata?.last_name || 
                          currentUser?.user_metadata?.lastName || '';

      const userPhoto = currentUser?.user_metadata?.avatar_url ||
                       currentUser?.user_metadata?.photo ||
                       undefined;

      return {
        user: {
          id: userId,
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
          photo: userPhoto
        },
        conversations: adminConversations,
        totalConversations: adminConversations.length,
        lastActivity: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error reading current user localStorage conversations:', error);
      return null;
    }
  }

  // Send response as a profile (admin responding as the AI profile)
  static async sendProfileResponse(conversationId: string, content: string, profileId: string, adminId: string): Promise<ChatMessage> {
    try {
      console.log('💬 [ADMIN] Sending profile response:', { 
        conversationId, 
        profileId, 
        adminId,
        profileIdType: typeof profileId,
        profileIdLength: profileId?.length
      });
      
      // Get conversation details
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        console.error('💬 [ADMIN] Error getting conversation:', convError);
        throw new Error('Conversation not found');
      }

      // Determine receiver (the real user in the conversation)
      const receiverId = conversation.user1_id === profileId ? conversation.user2_id : conversation.user1_id;
      
      console.log('💬 [ADMIN] Creating message with:', {
        sender_id: profileId,
        receiver_id: receiverId,
        content: content.substring(0, 30)
      });
      
      // Create the message
      const { data: message, error: msgError } = await supabaseAdmin
        .from('messages')
        .insert({
          sender_id: profileId,
          receiver_id: receiverId,
          content: content,
          type: 'text',
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single();

      if (msgError) {
        console.error('💬 [ADMIN] Error creating message:', msgError);
        throw new Error('Failed to create message');
      }

      // Update conversation's last_message_at and last_message_id
      await supabaseAdmin
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          last_message_id: message.id,
          user1_unread_count: conversation.user1_id === receiverId ? 1 : 0,
          user2_unread_count: conversation.user2_id === receiverId ? 1 : 0
        })
        .eq('id', conversationId);

      // Log admin action
      await AdminService.logAdminAction(adminId, 'send_message', {
        conversation_id: conversationId,
        profile_id: profileId,
        message_type: 'text'
      });

      return {
        id: message.id,
        conversationId: conversationId,
        content: message.content,
        role: 'assistant',
        timestamp: message.created_at,
        isAdminResponse: true,
        type: 'text'
      };
    } catch (error) {
      console.error('💬 [ADMIN] Error sending message:', error);
      throw error;
    }
  }

  // Send image message as profile
  static async sendImageMessage(conversationId: string, imageUrl: string, caption: string, profileId: string, adminId: string): Promise<ChatMessage> {
    try {
      console.log('📷 [ADMIN] Sending image message:', { conversationId, profileId, adminId, imageUrl });
      
      // Get conversation details
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        console.error('📷 [ADMIN] Error getting conversation:', convError);
        throw new Error('Conversation not found');
      }

      // Determine receiver (the real user in the conversation)
      const receiverId = conversation.user1_id === profileId ? conversation.user2_id : conversation.user1_id;
      
      // Create the message
      const { data: message, error: msgError } = await supabaseAdmin
        .from('messages')
        .insert({
          sender_id: profileId,
          receiver_id: receiverId,
          content: caption,
          type: 'image',
          image_url: imageUrl,
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single();

      if (msgError) {
        console.error('📷 [ADMIN] Error creating image message:', msgError);
        throw new Error('Failed to create image message');
      }

      // Update conversation's last_message_at and last_message_id
      await supabaseAdmin
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          last_message_id: message.id,
          user1_unread_count: conversation.user1_id === receiverId ? 1 : 0,
          user2_unread_count: conversation.user2_id === receiverId ? 1 : 0
        })
        .eq('id', conversationId);

      return {
        id: message.id,
        conversationId: conversationId,
        content: caption,
        role: 'assistant',
        timestamp: message.created_at,
        isAdminResponse: true,
        type: 'image',
        imageUrl: imageUrl
      };
    } catch (error) {
      console.error('📷 [ADMIN] Error sending image message:', error);
      throw error;
    }
  }

  // Send gift message as profile (admin sending gift as model)
  static async sendGiftMessage(conversationId: string, giftName: string, giftCost: number, profileId: string, adminId: string): Promise<ChatMessage> {
    try {
      console.log('🎁 [ADMIN] Sending gift message:', { conversationId, profileId, adminId, giftName, giftCost });
      
      // Get conversation details
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        console.error('🎁 [ADMIN] Error getting conversation:', convError);
        throw new Error('Conversation not found');
      }

      // Determine receiver (the real user in the conversation)
      const receiverId = conversation.user1_id === profileId ? conversation.user2_id : conversation.user1_id;
      
      console.log('🎁 [ADMIN] Gift message details:', {
        sender_id: profileId,
        receiver_id: receiverId,
        content: giftName,
        type: 'gift',
        gift_name: giftName,
        gift_cost: giftCost,
        conversation_user1: conversation.user1_id,
        conversation_user2: conversation.user2_id
      });
      
      // Create the gift message
      const { data: message, error: msgError } = await supabaseAdmin
        .from('messages')
        .insert({
          sender_id: profileId,
          receiver_id: receiverId,
          content: giftName,
          type: 'gift',
          gift_name: giftName,
          gift_cost: giftCost,
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single();

      if (msgError) {
        console.error('🎁 [ADMIN] Error creating gift message:', msgError);
        console.error('🎁 [ADMIN] Error details:', JSON.stringify(msgError, null, 2));
        throw new Error('Failed to create gift message');
      }

      console.log('🎁 [ADMIN] Gift message created successfully:', {
        messageId: message.id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        content: message.content,
        type: message.type
      });

      // Update conversation's last_message_at and last_message_id
      await supabaseAdmin
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          last_message_id: message.id,
          user1_unread_count: conversation.user1_id === receiverId ? 1 : 0,
          user2_unread_count: conversation.user2_id === receiverId ? 1 : 0
        })
        .eq('id', conversationId);

      return {
        id: message.id,
        conversationId: conversationId,
        content: giftName,
        role: 'assistant',
        timestamp: message.created_at,
        isAdminResponse: true,
        type: 'gift',
        giftData: {
          name: giftName,
          cost: giftCost,
          giftType: 'real'
        }
      };
    } catch (error) {
      console.error('🎁 [ADMIN] Error sending gift message:', error);
      throw error;
    }
  }

  // Update unread count for a specific user in a conversation
  static async updateUnreadCount(userId: string, otherUserId: string, unreadCount: number): Promise<void> {
    try {
      console.log('📊 [ADMIN] Updating unread count:', { userId, otherUserId, unreadCount });
      
      // Find the conversation between these two users
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id, user1_id, user2_id')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`)
        .single();

      if (convError || !conversation) {
        console.log('📊 [ADMIN] Conversation not found for unread count update');
        return;
      }

      // Determine which user's unread count to update
      let updateData: any = {};
      
      if (conversation.user1_id === userId) {
        // userId is user1, so update user1_unread_count
        updateData.user1_unread_count = unreadCount;
      } else if (conversation.user2_id === userId) {
        // userId is user2, so update user2_unread_count
        updateData.user2_unread_count = unreadCount;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('conversations')
          .update(updateData)
          .eq('id', conversation.id);

        if (updateError) {
          console.warn('📊 [ADMIN] Failed to update unread count:', updateError);
        } else {
          console.log('📊 [ADMIN] Successfully updated unread count');
        }
      }

    } catch (error) {
      console.error('📊 [ADMIN] Error updating unread count:', error);
    }
  }

  // Mark messages as read and clear unread count for admin viewing
  static async markConversationAsRead(userId: string, profileId: string): Promise<void> {
    try {
      console.log('📖 [ADMIN] Marking conversation as read:', { userId, profileId });
      
      // Find the conversation between these two users
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id, user1_id, user2_id, user1_unread_count, user2_unread_count')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${userId})`)
        .single();

      if (convError || !conversation) {
        console.log('📖 [ADMIN] Conversation not found, creating placeholder read status');
        return;
      }

      // Determine which user's unread count to clear
      // Since this is admin viewing, we want to clear the real user's unread count
      let updateData: any = {};
      
      if (conversation.user1_id === userId) {
        // userId is user1, so clear user1_unread_count
        updateData.user1_unread_count = 0;
      } else if (conversation.user2_id === userId) {
        // userId is user2, so clear user2_unread_count
        updateData.user2_unread_count = 0;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('conversations')
          .update(updateData)
          .eq('id', conversation.id);

        if (updateError) {
          console.warn('📖 [ADMIN] Failed to update conversation unread count:', updateError);
        } else {
          console.log('📖 [ADMIN] Successfully cleared unread count for conversation');
        }
      }

      // Also try to mark individual messages as read
      try {
        const { error: messagesError } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('receiver_id', userId)
          .eq('sender_id', profileId)
          .eq('read', false);

        if (messagesError) {
          console.warn('📖 [ADMIN] Failed to mark individual messages as read:', messagesError);
        }
      } catch (msgError) {
        console.warn('📖 [ADMIN] Could not mark individual messages as read:', msgError);
      }

    } catch (error) {
      console.error('📖 [ADMIN] Error marking conversation as read:', error);
    }
  }

  // Update conversation status
  static async updateConversationStatus(
    conversationId: string, 
    status: 'active' | 'archived' | 'flagged'
  ): Promise<void> {
    try {
      // Get the conversation to find the users
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conversationData) {
        console.warn('Conversation not found, using mock update');
        return;
      }

      // Update conversation settings for both users
      const updates = [
        {
          user_id: conversationData.user1_id,
          other_user_id: conversationData.user2_id,
          is_archived: status === 'archived',
          updated_at: new Date().toISOString()
        },
        {
          user_id: conversationData.user2_id,
          other_user_id: conversationData.user1_id,
          is_archived: status === 'archived',
          updated_at: new Date().toISOString()
        }
      ];

      // Update or insert conversation settings for both users
      for (const update of updates) {
        const { error: upsertError } = await supabase
          .from('conversation_settings')
          .upsert(update, {
            onConflict: 'user_id,other_user_id'
          });

        if (upsertError) {
          console.warn('Failed to update conversation settings:', upsertError);
        }
      }

      // For flagged conversations, you might want to add a separate reporting/moderation system
      if (status === 'flagged') {
        // Could add to a moderation queue table here
        console.log(`Conversation ${conversationId} flagged for moderation`);
      }

      console.log(`Updated conversation ${conversationId} status to ${status}`);
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  }

  // Get user management data
  static async getUsers(page: number = 1, limit: number = 20) {
    try {
      // In production, this would fetch paginated user data
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .range((page - 1) * limit, page * limit - 1)
      //   .order('created_at', { ascending: false });

      // Mock data for now
      return {
        users: [],
        total: 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    photos: string[];
    coins: number;
    gender: string;
    birthDate: string | null;
    country: string;
    city: string;
    profession: string;
    languages: string[];
    bio: string;
  }) {
    try {
      // Get the current user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      // Validate required fields
      if (!userData.firstName) throw new Error('First name is required');
      if (!userData.lastName) throw new Error('Last name is required');
      if (!userData.role) throw new Error('Role is required');

      // For models, generate email from their name
      let email = userData.email;
      if (userData.role === 'model' && !email) {
        // Convert name to lowercase, remove spaces, add domain
        const sanitizedFirstName = userData.firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const sanitizedLastName = userData.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
        email = `${sanitizedFirstName}.${sanitizedLastName}@model.lcn.com`;
      } else if (!email) {
        throw new Error('Email is required for non-model users');
      }

      // Call the database function to create the user
      const { data, error } = await supabase.rpc('create_user_with_profile', {
        admin_user_id: user.id,
        user_email: email,
        user_first_name: userData.firstName,
        user_last_name: userData.lastName,
        user_role: userData.role,
        user_photos: userData.photos || [],
        user_coins: userData.coins || 0,
        user_gender: userData.gender || 'female',
        user_birth_date: userData.birthDate || null,
        user_country: userData.country || '',
        user_city: userData.city || '',
        user_profession: userData.profession || '',
        user_languages: userData.languages || [],
        user_bio: userData.bio || ''
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || 'Failed to create user');
      }

      if (!data) {
        throw new Error('No data returned from create_user_with_profile');
      }

      return { user: data, error: null };
    } catch (error) {
      console.error('Error in createUser:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Unknown error occurred') 
      };
    }
  }

  // Log admin action for audit trail
  static async logAdminAction(adminId: string, action: string, details: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: adminId,
          action,
          details: details ? JSON.stringify(details) : null,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Database error logging admin action:', error);
        // Fallback to console logging
        console.log('Mock admin action logged:', { adminId, action, details });
      } else {
        console.log('Admin action logged to database:', { adminId, action, details });
      }
    } catch (error) {
      console.error('Error logging admin action:', error);
      console.log('Mock admin action logged:', { adminId, action, details });
    }
  }
}

// Export utility functions
export const adminUtils = {
  formatDate: (dateString: string) => {
    return new Date(dateString).toLocaleString();
  },
  
  formatNumber: (num: number) => {
    return num.toLocaleString();
  },
  
  getStatusColor: (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'flagged': return 'text-red-600 bg-red-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
}; 