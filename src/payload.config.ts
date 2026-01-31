import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { s3Storage } from '@payloadcms/storage-s3'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isBuild = process.env.BUILD === 'true'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: isBuild ? process.env.DATABASE_PUBLIC_URL || '' : process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: process.env.NODE_ENV === 'production',
      collections: {
        media: { prefix: 'media/' },
      },
      bucket: process.env.RAILWAY_BUCKET_NAME!,
      config: {
        credentials: {
          accessKeyId: process.env.RAILWAY_BUCKET_ACCESS_KEY_ID!,
          secretAccessKey: process.env.RAILWAY_BUCKET_SECRET_KEY!,
        },
        endpoint: process.env.RAILWAY_BUCKET_ENDPOINT!,
        region: 'auto',
        forcePathStyle: true,
      },
      acl: 'public-read',
    }),
  ],
})
