import { FirefliesSDK, UserRole } from '../src/fireflies';
import { TranscriptParams } from '../src/types';

class FirefliesUsageExamples {
  private fireflies: FirefliesSDK;

  constructor(apiKey: string) {
    this.fireflies = new FirefliesSDK({
      apiKey
    });
  }

  async getCurrentUser(fields: string[]) {
    const currentUser = await this.fireflies.getCurrentUser(fields);
    return currentUser;
  }

  async getUser(userId: string, fields: string[]) {
    const user = await this.fireflies.getUser(userId, fields);
    return user;
  }

  async getUsers(fields: string[]) {
    const user = await this.fireflies.getUsers(fields);
    return user;
  }

  async getTranscripts(params: TranscriptParams, fields: string[]) {
    const transcripts = await this.fireflies.getTranscripts(params, fields);
    return transcripts;
  }

  async deleteTranscriptExample(transcriptId: string) {
    try {
      const deletedTranscript = await this.fireflies.deleteTranscript(transcriptId);
      console.log('Successfully deleted transcript:', {
        title: deletedTranscript.title,
        date: new Date(deletedTranscript.date).toISOString(),
        duration: deletedTranscript.duration,
        organizerEmail: deletedTranscript.organizer_email
      });
      return deletedTranscript;
    } catch (error) {
      console.error('Failed to delete transcriptsss:', error);
      throw error;
    }
  }

  async userRoleManagementExample(userId: string) {
    // Set a user's role to admin
    const updatedUser = await this.fireflies.setUserRole(userId, UserRole.ADMIN);
    console.log('Updated user role:', {
      name: updatedUser.name,
      isAdmin: updatedUser.is_admin
    });

    // Set a user's role back to regular user
    const revertedUser = await this.fireflies.setUserRole(userId, UserRole.USER);
    console.log('Reverted user role:', {
      name: revertedUser.name,
      isAdmin: revertedUser.is_admin
    });

    return { updatedUser, revertedUser };
  }

  async getBitesExamples() {
    // Get list of bites for the current user
    const myBites = await this.fireflies.getBites({ 
      mine: true,
      limit: 10 
    }, ["id", "name", "status", "end_time", "start_time", "media_type", "created_at"]);
    for (const bite of myBites) {
      console.log('Bite:', {
        name: bite.name,
        status: bite.status,
        duration: bite.end_time - bite.start_time,
        mediaType: bite.media_type,
        createdAt: bite.created_at
      });
    }

    return myBites;
  }

  async getSpecificTranscriptBites(transcriptId: string) {
    const filter = ["id", "name", "status", "end_time", "start_time", "media_type", "created_at"];
    const transcriptBites = await this.fireflies.getBite(transcriptId, filter);
    return transcriptBites;
  }

  async getTeamBites() {
    const teamBites = await this.fireflies.getBites({
      my_team: true,
      limit: 10
    });
    console.log('Team bites:', teamBites.map(b => ({
      name: b.name,
      creator: b.user.name
    })));
    return teamBites;
  }

  async uploadAudioExample(audioUrl: string) {
    const uploadResult = await this.fireflies.uploadAudio({
      url: audioUrl,
      title: 'Important Team Meeting',
      custom_language: 'en',
      save_video: true,
      attendees: [
        {
          displayName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890'
        },
        {
          displayName: 'Jane Smith',
          email: 'jane@example.com'
        }
      ],
      webhook: 'https://your-webhook.com/fireflies-callback',
      client_reference_id: 'meeting-2024-03-21'
    });
    return uploadResult;
  }

  async createBiteExamples(transcriptId: string) {
    // Create a detailed bite
    const newBite = await this.fireflies.createBite({
      transcript_id: transcriptId,
      name: 'Important Discussion Highlight',
      start_time: 120,
      end_time: 180,
      media_type: 'video',
      privacies: ['team', 'participants'],
      summary: 'Key discussion about Q2 objectives'
    });

    console.log('Created new bite:', {
      id: newBite.id,
      name: newBite.name,
      status: newBite.status
    });

    // Create a quick bite
    const quickBite = await this.fireflies.createBite({
      transcript_id: transcriptId,
      start_time: 300,
      end_time: 360
    });

    console.log('Created quick bite:', {
      id: quickBite.id,
      status: quickBite.status
    });

    return { newBite, quickBite };
  }

  async addToLiveMeetingExamples() {
    // Regular meeting
    const liveMeetingResult = await this.fireflies.addToLiveMeeting({
      meeting_link: 'https://meet.google.com/your-meeting-code',
      title: 'Weekly Team Sync',
      duration: 45,
      language: 'en',
      attendees: [
        {
          displayName: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890'
        },
        {
          displayName: 'Jane Smith',
          email: 'jane@example.com'
        }
      ]
    });

    // Protected meeting
    const protectedMeetingResult = await this.fireflies.addToLiveMeeting({
      meeting_link: 'https://zoom.us/j/your-meeting-id',
      meeting_password: 'meeting123',
      duration: 60
    });

    return { liveMeetingResult, protectedMeetingResult };
  }
}

// Example usage:
async function main() {
  try {
    const examples = new FirefliesUsageExamples('FIREFLIES_API_KEY');
    
    // const userFields = ["user_id", "email", "name", "num_transcripts"];
    const meetingFields = ["privacy", "id"];

    // Test individual methods
    // let resp = await examples.getCurrentUser(userFields);
 
    // let resp = await examples.getTranscripts({
    //   limit: 50,
    //   mine: true
    // }, meetingFields);
    // console.log(resp);

    // await examples.deleteTranscriptExample('transcript_id_to_delete');
    // await examples.userRoleManagementExample('target_user_id');
    // let resp = await examples.getBitesExamples();
    // console.log(resp);

    // let resp = await examples.getSpecificTranscriptBites('yGLC8RIcBaO');
   
    // await examples.getSpecificTranscriptBites('your_transcript_id');

    // await examples.getTeamBites();
    let resp = await examples.uploadAudioExample('https://www.flatworldsolutions.com/transcription/samples/Monologue.mp3');
    console.log(resp);

    // await examples.createBiteExamples('your_transcript_id');
    // await examples.addToLiveMeetingExamples();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the examples
main(); 