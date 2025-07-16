import { supabase } from './supabase';

// Utility functions for admin to access locally stored conversations
export class AdminConversationUtils {
  
  // Create sample conversations for testing admin interface
  static async createSampleConversations() {
    try {
      // First, create sample users if they don't exist
      const sampleUsers = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          first_name: 'Emma',
          last_name: 'Johnson',
          role: 'user',
          country: 'Ukraine',
          city: 'Kyiv',
          profession: 'Designer',
          photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b353?w=150&h=150&fit=crop&crop=face']
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          first_name: 'Michael',
          last_name: 'Smith',
          role: 'user',
          country: 'USA',
          city: 'New York',
          profession: 'Engineer',
          photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face']
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          first_name: 'Sofia',
          last_name: 'Martinez',
          role: 'user',
          country: 'Spain',
          city: 'Madrid',
          profession: 'Artist',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face']
        }
      ];

      // Insert sample users
      for (const user of sampleUsers) {
        const { error } = await supabase
          .from('profiles')
          .upsert(user, { onConflict: 'id' });
        
        if (error) {
          console.warn('Failed to create sample user:', error);
        }
      }

      // Create sample conversations
      const sampleConversations = [
        {
          user1_id: '550e8400-e29b-41d4-a716-446655440001',
          user2_id: '550e8400-e29b-41d4-a716-446655440002',
          last_message_at: new Date(Date.now() - 3600000).toISOString(),
          user1_unread_count: 2,
          user2_unread_count: 0,
          is_active: true
        },
        {
          user1_id: '550e8400-e29b-41d4-a716-446655440001',
          user2_id: '550e8400-e29b-41d4-a716-446655440003',
          last_message_at: new Date(Date.now() - 7200000).toISOString(),
          user1_unread_count: 0,
          user2_unread_count: 1,
          is_active: true
        }
      ];

      for (const conv of sampleConversations) {
        const { error } = await supabase
          .from('conversations')
          .upsert(conv, { onConflict: 'user1_id,user2_id' });
        
        if (error) {
          console.warn('Failed to create sample conversation:', error);
        }
      }

      // Create sample messages
      const sampleMessages = [
        {
          sender_id: '550e8400-e29b-41d4-a716-446655440002',
          receiver_id: '550e8400-e29b-41d4-a716-446655440001',
          content: 'Hi Emma! How are you doing today?',
          type: 'text',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          sender_id: '550e8400-e29b-41d4-a716-446655440001',
          receiver_id: '550e8400-e29b-41d4-a716-446655440002',
          content: 'Hey Michael! I\'m doing great, thanks for asking! Just finished a design project. What about you?',
          type: 'text',
          read: true,
          created_at: new Date(Date.now() - 3300000).toISOString()
        },
        {
          sender_id: '550e8400-e29b-41d4-a716-446655440002',
          receiver_id: '550e8400-e29b-41d4-a716-446655440001',
          content: 'That sounds amazing! I\'d love to see your work sometime. I\'m working on a new engineering project myself.',
          type: 'text',
          read: false,
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          sender_id: '550e8400-e29b-41d4-a716-446655440003',
          receiver_id: '550e8400-e29b-41d4-a716-446655440001',
          content: 'Hello Emma! I saw your profile and I love your artistic style. I\'m also in the creative field!',
          type: 'text',
          read: false,
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      for (const message of sampleMessages) {
        const { error } = await supabase
          .from('messages')
          .insert(message);
        
        if (error) {
          console.warn('Failed to create sample message:', error);
        }
      }

      console.log('Sample conversations created successfully!');
      return { success: true, message: 'Sample data created' };

    } catch (error) {
      console.error('Error creating sample conversations:', error);
      return { success: false, error };
    }
  }

  // Get localStorage data for a specific user (for admin debugging)
  static getLocalStorageConversations(userId: string) {
    try {
      const storageKey = `conversations_${userId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      return null;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return null;
    }
  }

  // Sync localStorage conversations to database (for admin access)
  static async syncLocalStorageToDatabase(userId: string) {
    try {
      const localConversations = this.getLocalStorageConversations(userId);
      
      if (!localConversations || !Array.isArray(localConversations)) {
        return { success: false, message: 'No local conversations found' };
      }

      let syncedCount = 0;

      for (const conv of localConversations) {
        // Sync conversation metadata
        const [user1_id, user2_id] = [userId, conv.id].sort();
        
        const { error: convError } = await supabase
          .from('conversations')
          .upsert({
            user1_id,
            user2_id,
            last_message_at: conv.lastMessageTime,
            user1_unread_count: userId === user1_id ? 0 : conv.unreadCount,
            user2_unread_count: userId === user2_id ? 0 : conv.unreadCount,
            is_active: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user1_id,user2_id'
          });

        if (convError) {
          console.warn('Failed to sync conversation:', convError);
          continue;
        }

        // Sync messages
        if (conv.messages && Array.isArray(conv.messages)) {
          for (const message of conv.messages) {
            const { error: msgError } = await supabase
              .from('messages')
              .insert({
                sender_id: message.isOwn ? userId : conv.id,
                receiver_id: message.isOwn ? conv.id : userId,
                content: message.text,
                type: message.type || 'text',
                read: message.isOwn ? true : false,
                created_at: message.timestamp
              });

            if (msgError) {
              console.warn('Failed to sync message:', msgError);
            }
          }
        }

        syncedCount++;
      }

      return { 
        success: true, 
        message: `Synced ${syncedCount} conversations to database`,
        syncedCount 
      };

    } catch (error) {
      console.error('Error syncing to database:', error);
      return { success: false, error };
    }
  }

  // Clear all sample data (for testing)
  static async clearSampleData() {
    try {
      const sampleUserIds = [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003'
      ];

      // Delete messages
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('sender_id', sampleUserIds);

      // Delete conversations
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .or(`user1_id.in.(${sampleUserIds.join(',')}),user2_id.in.(${sampleUserIds.join(',')})`);

      // Delete profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .in('id', sampleUserIds);

      if (messagesError || conversationsError || profilesError) {
        console.warn('Some errors occurred while clearing sample data:', {
          messagesError,
          conversationsError,
          profilesError
        });
      }

      console.log('Sample data cleared successfully!');
      return { success: true, message: 'Sample data cleared' };

    } catch (error) {
      console.error('Error clearing sample data:', error);
      return { success: false, error };
    }
  }

  // Create demo AI profiles in database for conversation storage
  static async createDemoAIProfiles() {
    try {
      // Demo AI profiles that match the frontend data
      const demoProfiles = [
        {
          id: '11111111-1111-1111-1111-111111111111', // Profile ID: 1
          first_name: 'Emma',
          last_name: 'Watson',
          role: 'user',
          country: 'Ukraine',
          city: 'Kyiv',
          profession: 'Model',
          birth_date: '1995-03-15',
          photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b353?w=400&h=400&fit=crop&crop=face'],
          bio: 'Looking for genuine connection and meaningful conversations. I love art, travel, and good wine.'
        },
        {
          id: '22222222-2222-2222-2222-222222222222', // Profile ID: 2  
          first_name: 'Sofia',
          last_name: 'Rodriguez',
          role: 'user',
          country: 'Ukraine',
          city: 'Odesa',
          profession: 'Designer',
          birth_date: '1993-07-22',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'],
          bio: 'Creative soul with a passion for design and photography. Always up for new adventures!'
        },
        {
          id: '33333333-3333-3333-3333-333333333333', // Profile ID: 3
          first_name: 'Isabella',
          last_name: 'Martinez',
          role: 'user',
          country: 'Ukraine', 
          city: 'Lviv',
          profession: 'Teacher',
          birth_date: '1992-11-08',
          photos: ['https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face'],
          bio: 'Educator by day, book lover by night. Seeking someone who values intelligence and kindness.'
        },
        {
          id: '44444444-4444-4444-4444-444444444444', // Profile ID: 4
          first_name: 'Anastasia',
          last_name: 'Petrov',
          role: 'user',
          country: 'Ukraine',
          city: 'Kharkiv',
          profession: 'Photographer',
          birth_date: '1994-05-12',
          photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'],
          bio: 'Capturing beautiful moments through my lens. Love nature, coffee, and deep conversations.'
        },
        {
          id: '55555555-5555-5555-5555-555555555555', // Profile ID: 5
          first_name: 'Katarina',
          last_name: 'Volkov',
          role: 'user',
          country: 'Ukraine',
          city: 'Dnipro',
          profession: 'Dancer',
          birth_date: '1996-09-03',
          photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face'],
          bio: 'Professional dancer with a love for music and movement. Looking for someone to dance through life with.'
        },
        {
          id: '66666666-6666-6666-6666-666666666666', // Profile ID: 6
          first_name: 'Alina',
          last_name: 'Kozlov',
          role: 'user',
          country: 'Ukraine',
          city: 'Zaporizhzhia',
          profession: 'Chef',
          birth_date: '1991-12-18',
          photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face'],
          bio: 'Culinary artist who believes food is love. Enjoy cooking, wine tasting, and romantic dinners.'
        },
        {
          id: '77777777-7777-7777-7777-777777777777', // Profile ID: 7
          first_name: 'Oksana',
          last_name: 'Kovalenko',
          role: 'user',
          country: 'Ukraine',
          city: 'Poltava',
          profession: 'Nurse',
          birth_date: '1993-02-25',
          photos: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face'],
          bio: 'Caring healthcare professional with a big heart. Love helping others and making a difference.'
        },
        {
          id: '88888888-8888-8888-8888-888888888888', // Profile ID: 8
          first_name: 'Yulia',
          last_name: 'Bondarenko',
          role: 'user',
          country: 'Ukraine',
          city: 'Mykolaiv',
          profession: 'Lawyer',
          birth_date: '1990-06-30',
          photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'],
          bio: 'Intelligent professional who values honesty and loyalty. Seeking a meaningful relationship.'
        }
      ];

      console.log('💫 Creating demo AI profiles in database...');

      // Insert demo profiles
      for (const profile of demoProfiles) {
        const { error } = await supabase
          .from('profiles')
          .upsert(profile, { onConflict: 'id' });
        
        if (error) {
          console.warn('Failed to create demo profile:', profile.first_name, error);
        } else {
          console.log(`✅ Created demo profile: ${profile.first_name} ${profile.last_name}`);
        }
      }

      console.log('🎉 Demo AI profiles created successfully!');
      return { success: true, message: 'Demo AI profiles created' };

    } catch (error) {
      console.error('Error creating demo AI profiles:', error);
      return { success: false, error };
    }
  }

  // Helper function to convert profile IDs to UUID format
  static profileIdToUUID(profileId: string): string {
    const profileUUIDs: { [key: string]: string } = {
      '1': '11111111-1111-1111-1111-111111111111',
      '2': '22222222-2222-2222-2222-222222222222',
      '3': '33333333-3333-3333-3333-333333333333',
      '4': '44444444-4444-4444-4444-444444444444',
      '5': '55555555-5555-5555-5555-555555555555',
      '6': '66666666-6666-6666-6666-666666666666',
      '7': '77777777-7777-7777-7777-777777777777',
      '8': '88888888-8888-8888-8888-888888888888'
    };
    
    return profileUUIDs[profileId] || profileId;
  }

  // Ensure admin functions exist in database
  static async ensureAdminFunctions(): Promise<void> {
    try {
      console.log('🔧 [ADMIN] Ensuring admin functions exist...');
      
      const adminFunctionSQL = `
        -- Admin functions to bypass RLS for admin panel access
        CREATE OR REPLACE FUNCTION get_all_conversations_for_admin(user_ids UUID[])
        RETURNS TABLE (
          id UUID,
          user1_id UUID,
          user2_id UUID,
          last_message_id UUID,
          last_message_at TIMESTAMPTZ,
          user1_unread_count INTEGER,
          user2_unread_count INTEGER,
          is_active BOOLEAN,
          created_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ
        )
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          -- Check if the current user is an admin
          IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
          ) THEN
            RAISE EXCEPTION 'Access denied: Admin privileges required';
          END IF;

          -- Return all conversations involving the specified user IDs
          RETURN QUERY
          SELECT 
            c.id,
            c.user1_id,
            c.user2_id,
            c.last_message_id,
            c.last_message_at,
            c.user1_unread_count,
            c.user2_unread_count,
            c.is_active,
            c.created_at,
            c.updated_at
          FROM conversations c
          WHERE c.user1_id = ANY(user_ids) OR c.user2_id = ANY(user_ids)
          ORDER BY c.last_message_at DESC NULLS LAST;
        END;
        $$;

        CREATE OR REPLACE FUNCTION get_all_messages_for_admin(conversation_user1_id UUID, conversation_user2_id UUID)
        RETURNS TABLE (
          id UUID,
          sender_id UUID,
          receiver_id UUID,
          content TEXT,
          read BOOLEAN,
          created_at TIMESTAMPTZ,
          message_type VARCHAR(20)
        )
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          -- Check if the current user is an admin
          IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
          ) THEN
            RAISE EXCEPTION 'Access denied: Admin privileges required';
          END IF;

          -- Return all messages between the two users
          RETURN QUERY
          SELECT 
            m.id,
            m.sender_id,
            m.receiver_id,
            m.content,
            m.read,
            m.created_at,
            m.message_type
          FROM messages m
          WHERE (
            (m.sender_id = conversation_user1_id AND m.receiver_id = conversation_user2_id) OR
            (m.sender_id = conversation_user2_id AND m.receiver_id = conversation_user1_id)
          )
          ORDER BY m.created_at ASC;
        END;
        $$;

        GRANT EXECUTE ON FUNCTION get_all_conversations_for_admin(UUID[]) TO authenticated;
        GRANT EXECUTE ON FUNCTION get_all_messages_for_admin(UUID, UUID) TO authenticated;
      `;

      // Execute the SQL to create functions
      const { error } = await supabase.rpc('exec_sql', { sql: adminFunctionSQL });
      
      if (error) {
        console.warn('🔧 [ADMIN] Could not create admin functions:', error);
        console.log('🔧 [ADMIN] Admin functions may already exist or database may not support dynamic SQL');
      } else {
        console.log('✅ [ADMIN] Admin functions created successfully');
      }
    } catch (error) {
      console.warn('🔧 [ADMIN] Error ensuring admin functions:', error);
    }
  }
} 