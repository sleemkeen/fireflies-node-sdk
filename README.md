# Fireflies.ai Node.js SDK

A Node.js SDK for interacting with the Fireflies.ai GraphQL API. This SDK provides a simple interface to access Fireflies.ai's meeting transcription and analysis features.

## Installation

```bash
npm install @fireflies/node-sdk
# or
yarn add @fireflies/node-sdk
```

## Quick Start

```javascript
const { FirefliesSDK } = require('@fireflies/node-sdk');
// Or using ES modules:
// import { FirefliesSDK } from '@fireflies/node-sdk';

const fireflies = new FirefliesSDK({
  apiKey: process.env.FIREFLIES_API_KEY
});

async function main() {
  try {
    // Get current user info - see docs.fireflies.ai for all available fields
    const userInfo = await fireflies.getCurrentUser(['email', 'name']);
    console.log('User:', userInfo);

    // Get recent transcripts - see docs.fireflies.ai for all available fields
    const transcripts = await fireflies.getTranscripts(
      { limit: 10, mine: true },
      ['id', 'title']
    );
    console.log('Recent transcripts:', transcripts);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Environment Variables

Create a `.env` file in your project root:

```env
FIREFLIES_API_KEY=your_api_key_here
```

## Features

- User Management
  - Get current user
  - Get user by ID
  - Set user roles
- Transcript Management
  - Get transcripts
  - Get single transcript
  - Delete transcript
- Bites (Meeting Highlights)
  - Create bites
  - Get bites
  - Get single bite
- Audio Upload
  - Upload audio files for transcription
- Live Meeting Integration
  - Add Fireflies to live meetings

## API Reference

For a complete list of available fields and schema information, please refer to the [official Fireflies.ai documentation](https://docs.fireflies.ai).

### User Methods

```javascript
// Get current user - see docs.fireflies.ai for all available fields
await fireflies.getCurrentUser(['email', 'name']);

// Get user by ID - see docs.fireflies.ai for all available fields
await fireflies.getUser('user_id', ['email', 'name']);

// Set user role
await fireflies.setUserRole('user_id', 'admin');
```

### Transcript Methods

```javascript
// Get transcripts - see docs.fireflies.ai for all available fields
await fireflies.getTranscripts(
  { limit: 50, mine: true },
  ['id', 'title', 'privacy']
);

// Get single transcript - see docs.fireflies.ai for all available fields
await fireflies.getTranscript('transcript_id', ['id', 'title']);

// Delete transcript
await fireflies.deleteTranscript('transcript_id');
```

### Bites Methods

```javascript
// Get bites - see docs.fireflies.ai for all available fields
await fireflies.getBites(
  { mine: true, limit: 10 },
  ['id', 'name', 'status']
);

// Create bite
await fireflies.createBite({
  transcript_id: 'transcript_id',
  start_time: 120,
  end_time: 180
});
```

### Audio Upload

```javascript
await fireflies.uploadAudio({
  url: 'https://example.com/audio.mp3',
  title: 'Meeting Recording',
  custom_language: 'en'
});
```

## Error Handling

The SDK uses standard Node.js error handling:

```javascript
try {
  const transcripts = await fireflies.getTranscripts();
} catch (error) {
  if (error.message.includes('API Error')) {
    console.error('Fireflies API Error:', error.message);
  } else {
    console.error('Network or other error:', error);
  }
}
```

## Examples

Check the [examples](./examples) directory for more usage examples.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build package
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

- [Haruna Ahmadu](https://github.com/sleemkeen)
- [Peter Coates](https://github.com/petercoates)
- [All Contributors](../../contributors)

## License

MIT

## Support

- [Official Documentation](https://docs.fireflies.ai)
- [API Reference](https://docs.fireflies.ai/graphql-api)
- [Support Portal](https://help.fireflies.ai)
- [GitHub Issues](https://github.com/fireflies-ai/node-sdk/issues)
```