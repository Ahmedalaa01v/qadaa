"use client"

import { Component } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
    
    // In production, you might want to send to error monitoring service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                حدث خطأ غير متوقع
              </h1>
              <p className="text-muted-foreground">
                عذراً، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-xs bg-muted p-3 rounded-md">
                <summary className="cursor-pointer mb-2 font-medium">
                  تفاصيل الخطأ (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                حاول مرة أخرى
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                إعادة تحميل الصفحة
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              إذا استمر هذا الخطأ، يرجى الاتصال بالدعم الفني
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 