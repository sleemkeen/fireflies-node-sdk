import axios, { AxiosInstance } from 'axios';
import { generateGraphQLFilter } from './helper';
import {
  FirefliesConfig,
  AIAppOutput,
  AIAppsQueryParams,
  UserData,
  TranscriptData,
  TranscriptsQueryParams,
  BiteData,
  BitesQueryParams,
  UserRole,
  SetUserRoleResponse,
  DeleteTranscriptResponse,
  AudioUploadInput,
  AudioUploadResponse,
  CreateBiteInput,
  CreateBiteResponse,
  AddToLiveMeetingInput,
  AddToLiveMeetingResponse
} from './types';

export interface AIFilter {
  task: string;
  pricing: string;
  metric: string;
  question: string;
  date_and_time: string;
  text_cleanup: string;
  sentiment: string;
}

export interface MeetingInfo {
  fred_joined: boolean;
  silent_meeting: boolean;
  summary_status: string;
}

export interface Sentence {
  index: number;
  speaker_name: string;
  speaker_id: string;
  meeting_info: MeetingInfo;
  text: string;
  raw_text: string;
  start_time: number;
  end_time: number;
  ai_filters: AIFilter;
}

export interface Speaker {
  id: string;
  name: string;
}

export interface MeetingAttendee {
  displayName: string;
  email: string;
  phoneNumber?: string;
  name: string;
  location?: string;
}

export interface Summary {
  keywords: string[];
  action_items: string[];
  outline: string[];
  shorthand_bullet: string;
  overview: string;
  bullet_gist: string;
  gist: string;
  short_summary: string;
  short_overview: string;
  meeting_type: string;
  topics_discussed: string[];
  transcript_chapters: string[];
}

export interface BiteCaption {
  end_time: number;
  index: number;
  speaker_id: string;
  speaker_name: string;
  start_time: number;
  text: string;
}

export interface BiteSource {
  src: string;
  type: string;
}

export interface BiteCreatedFrom {
  description: string;
  duration: number;
  id: string;
  name: string;
  type: string;
}

export interface BiteUser {
  first_name: string;
  last_name: string;
  picture: string;
  name: string;
  id: string;
}

export class FirefliesSDK {
  private client: AxiosInstance;
  private static DEFAULT_BASE_URL = 'https://api.fireflies.ai/graphql';

  constructor(config: FirefliesConfig) {
    this.client = axios.create({
      baseURL: config.baseURL || FirefliesSDK.DEFAULT_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      }
    });
  }

  private async executeGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    try {
      const response = await this.client.post('', {
        query,
        variables
      });

      // GraphQL responses always have a data property containing the actual response
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data)
        throw new Error(`Fireflies API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async getAIAppsOutputs(params: AIAppsQueryParams = {}, filter: string[]): Promise<AIAppOutput[]> {
    const query = `
      query GetAIAppsOutputs($app_id: String, $transcript_id: String, $skip: Float, $limit: Float) {
        apps(app_id: $app_id, transcript_id: $transcript_id, skip: $skip, limit: $limit) {
          outputs {
           ${generateGraphQLFilter(filter)}
          }
        }
      }
    `;

    const response = await this.executeGraphQL<{ apps: { outputs: AIAppOutput[] } }>(query, params);
    return response.apps.outputs;
  }

  async getUser(userId: string, filter: string[] = []): Promise<UserData> {
    const query = `
      query User($userId: String) {
        user(id: $userId) {
          ${generateGraphQLFilter(filter)}
        }
      }
    `;

    const response = await this.executeGraphQL<{ user: UserData }>(query, userId ? { userId } : {});
    return response.user;
  }

  async getUsers(filter: string[] = []): Promise<UserData> {
    const query = `
      query Users {
        users {
          ${generateGraphQLFilter(filter)}
        }
      }
    `;

    const response = await this.executeGraphQL<{ users: UserData }>(query, {});
    return response.users;
  }

  async getCurrentUser(filter: string[] = []): Promise<UserData> {
    return this.getUser('', filter);
  }

  async getTranscript(transcriptId: string, filter: string[] = []): Promise<TranscriptData> {
    const query = `
      query Transcript($transcriptId: String!) {
        transcript(id: $transcriptId) {
          ${generateGraphQLFilter(filter)}
        }
      }
    `;

    const response = await this.executeGraphQL<{ transcript: TranscriptData }>(query, { transcriptId });
    return response.transcript;
  }

  async getTranscripts(params: TranscriptsQueryParams = {}, filter: string[] = []): Promise<TranscriptData[]> {
    const query = `
      query Transcripts(
            $title: String
            $date: Float
            $limit: Int
            $skip: Int
            $hostEmail: String
            $participantEmail: String
            $userId: String
        ) {
        transcripts(
            title: $title
            date: $date
            limit: $limit
            skip: $skip
            host_email: $hostEmail
            participant_email: $participantEmail
            user_id: $userId
        ) {
          ${generateGraphQLFilter(filter)}
        }
      }
    `;
    
    const response = await this.executeGraphQL<{ transcripts: TranscriptData[] }>(query, {
      ...params,
      hostEmail: params.host_email,
      organizerEmail: params.organizer_email,
      participantEmail: params.participant_email,
      userId: params.user_id
    });
    return response.transcripts;
  }

  async getBite(biteId: string, filter: string[] = []): Promise<BiteData> {
    const query = `
      query Bite($biteId: ID!) {
        bite(id: $biteId) {
            ${generateGraphQLFilter(filter)}
        }
      }
    `;

    const response = await this.executeGraphQL<{ bite: BiteData }>(query, { biteId });
    return response.bite;
  }

  async getBites(params: BitesQueryParams = {}, filter: string[] = []): Promise<BiteData[]> {
    const query = `
      query Bites($mine: Boolean, $transcript_id: ID, $my_team: Boolean, $limit: Int) {
        bites(mine: $mine, transcript_id: $transcript_id, my_team: $my_team, limit: $limit) {
          ${generateGraphQLFilter(filter)}
        }
      }
    `;

    const response = await this.executeGraphQL<{ bites: BiteData[] }>(query, params);
    return response.bites;
  }

  async setUserRole(userId: string, role: UserRole): Promise<SetUserRoleResponse> {
    const query = `
      mutation SetUserRole($userId: String!, $role: Role!) {
        setUserRole(user_id: $userId, role: $role) {
          name
          is_admin
        }
      }
    `;

    const response = await this.executeGraphQL<{ setUserRole: SetUserRoleResponse }>(query, {
      userId,
      role
    });
    return response.setUserRole;
  }

  async deleteTranscript(transcriptId: string): Promise<DeleteTranscriptResponse> {
    const query = `
      mutation DeleteTranscript($transcriptId: String!) {
        deleteTranscript(id: $transcriptId) {
          title
          date
          duration
          organizer_email
        }
      }
    `;

    const response = await this.executeGraphQL<{ deleteTranscript: DeleteTranscriptResponse }>(query, { transcriptId });
    return response.deleteTranscript;
  }

  async uploadAudio(input: AudioUploadInput): Promise<AudioUploadResponse> {
    const query = `
      mutation UploadAudio($input: AudioUploadInput!) {
        uploadAudio(input: $input) {
          success
          title
          message
        }
      }
    `;

    const response = await this.executeGraphQL<{ uploadAudio: AudioUploadResponse }>(query, { input });
    return response.uploadAudio;
  }

  async createBite(input: CreateBiteInput): Promise<CreateBiteResponse> {
    const query = `
      mutation CreateBite(
        $transcript_id: ID!,
        $name: String,
        $start_time: Float!,
        $end_time: Float!,
        $media_type: String,
        $privacies: [String],
        $summary: String
      ) {
        createBite(
          transcript_id: $transcript_id,
          name: $name,
          start_time: $start_time,
          end_time: $end_time,
          media_type: $media_type,
          privacies: $privacies,
          summary: $summary
        ) {
          status
          name
          id
        }
      }
    `;

    const response = await this.executeGraphQL<{ createBite: CreateBiteResponse }>(query, input);
    return response.createBite;
  }

  async addToLiveMeeting(input: AddToLiveMeetingInput): Promise<AddToLiveMeetingResponse> {
    const query = `
      mutation AddToLiveMeeting(
        $meeting_link: String!
        $title: String
        $meeting_password: String
        $duration: Int
        $language: String
        $attendees: [Attendee]
      ) {
        addToLiveMeeting(
          meeting_link: $meeting_link
          title: $title
          meeting_password: $meeting_password
          duration: $duration
          language: $language
          attendees: $attendees
        ) {
          success
        }
      }
    `;

    const response = await this.executeGraphQL<{ addToLiveMeeting: AddToLiveMeetingResponse }>(query, input);
    return response.addToLiveMeeting;
  }
}

// Re-export types for convenience
export * from './types'; 