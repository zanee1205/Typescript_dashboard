import './index.css'
import App from './App.tsx'
import React from "react"
import ReactDOM from "react-dom/client"
import 'antd/dist/reset.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);