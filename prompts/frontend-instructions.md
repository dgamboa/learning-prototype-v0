# Frontend Instructions

Follow these instructions to create new frontend components.

## Guidelines

- Always use the hooks from @/hooks/use-toast to show toasts.

### Project Structure

- The components should go in the `components` folder at the root of the project.
- Put all components that you create in the `components` folder.
- Do not crate any new components folders, use the existing one.
- Group similar components in the same folder within the `components` folder.
- All types are going to come from the table schema found in the `db/schema` folder.

### Server Components

- Use server components to fetch data nad pass the data to the client components.

### Client Components

- Client components need `use client` directive at the top of the file. So anytime you use useState, useEffect, useContext, useRef, etc. you need to use 'use client' at the top of the file.
- Always use client components for user interaction and other client-specific logic.