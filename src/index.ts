import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { seedRoomsIfNeeded } from './utils/seedRooms';

async function startServer() {
  try {
    await connectDatabase();
    await seedRoomsIfNeeded();

    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Unable to start backend:', error);
    process.exit(1);
  }
}

startServer();
