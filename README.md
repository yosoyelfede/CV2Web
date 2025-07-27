# CV2W Frontend

A modern, responsive frontend for the CV-to-Website automation system. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Clean, minimalistic interface with creative visual elements
- **Responsive Layout**: Mobile-first design that works on all devices
- **Real-time Processing**: Live status updates and progress tracking
- **Interactive Upload**: Drag-and-drop CV file upload with validation
- **Website Preview**: Real-time preview using Claude Artifacts
- **Authentication**: Secure user authentication with Supabase
- **Dashboard**: Comprehensive dashboard for managing CVs and websites
- **Batch Processing**: Handle multiple CVs simultaneously
- **Quality Assurance**: Human-supervised workflows with automated testing

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **AI Integration**: Claude SDK
- **File Upload**: React Dropzone
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cv2w-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard routes
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── badge.tsx
│   ├── layout/           # Layout components
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   └── features/         # Feature-specific components
│       └── cv-upload/
│           └── cv-uploader.tsx
├── lib/
│   ├── utils.ts          # Utility functions
│   └── auth/             # Authentication utilities
├── types/
│   └── index.ts          # TypeScript definitions
└── styles/               # Additional styles
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Trust and professionalism
- **Secondary**: Slate grays - Sophistication and neutrality
- **Success**: Green (#10B981) - Success states
- **Warning**: Yellow (#F59E0B) - Warning states
- **Error**: Red (#EF4444) - Error states

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Hierarchy**: Clear typographic scale with proper contrast

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost, destructive)
- **Cards**: Clean containers with subtle shadows
- **Inputs**: Consistent form controls with validation states
- **Modals**: Accessible modal dialogs with backdrop
- **Badges**: Status indicators and labels

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Automatic code formatting
- **Conventions**: Follow React and Next.js best practices

### Component Guidelines

1. **Use TypeScript**: All components should be typed
2. **Follow Naming**: Use PascalCase for components, camelCase for functions
3. **Props Interface**: Define clear prop interfaces
4. **Default Props**: Provide sensible defaults
5. **Error Handling**: Implement proper error boundaries
6. **Accessibility**: Follow WCAG 2.1 guidelines

### State Management

- **Local State**: Use React hooks for component state
- **Global State**: React Context for auth and user data
- **Server State**: Custom hooks for API calls
- **Form State**: React Hook Form for form management

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add your environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 🔒 Security

- **Authentication**: Supabase Auth with JWT tokens
- **CORS**: Proper CORS configuration
- **Environment Variables**: Sensitive data in environment variables
- **Input Validation**: Client and server-side validation
- **HTTPS**: Force HTTPS in production

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component testing with Jest and React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Full user journey testing with Playwright
- **Accessibility Tests**: Automated a11y testing

### Running Tests

```bash
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:a11y     # Run accessibility tests
```

## 📊 Performance

### Optimization Techniques

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: Static generation and ISR
- **Bundle Analysis**: Regular bundle size monitoring

### Core Web Vitals

Target metrics:
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Workflow

1. **Create Issue**: Describe the feature or bug
2. **Branch**: Create feature branch from main
3. **Develop**: Implement the feature with tests
4. **Test**: Ensure all tests pass
5. **Review**: Create PR for code review
6. **Merge**: Merge after approval

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.cv2w.com](https://docs.cv2w.com)
- **Issues**: [GitHub Issues](https://github.com/cv2w/frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cv2w/frontend/discussions)
- **Email**: support@cv2w.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Supabase](https://supabase.com/) - Backend as a Service
- [Anthropic](https://anthropic.com/) - Claude AI
- [Vercel](https://vercel.com/) - Deployment platform 