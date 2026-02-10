// AWS Configuration for VirtualHEMS
export interface AWSConfig {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
  identityPoolId: string;
  apiEndpoint: string;
}

// Load config from backend or use environment variables
let cachedConfig: AWSConfig | null = null;

export async function getAWSConfig(): Promise<AWSConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/config`);
    const data = await response.json();
    
    cachedConfig = {
      region: data.aws_region || 'us-east-1',
      userPoolId: data.user_pool_id,
      userPoolClientId: data.user_pool_client_id,
      identityPoolId: data.identity_pool_id,
      apiEndpoint: import.meta.env.VITE_API_URL || ''
    };
    
    return cachedConfig;
  } catch (error) {
    console.error('Failed to load AWS config:', error);
    // Fallback to hardcoded values
    return {
      region: 'us-east-1',
      userPoolId: 'us-east-1_1c0V6g4OQ',
      userPoolClientId: '682jtce3sr02pne6vf9f0tk8ak',
      identityPoolId: 'us-east-1:bf4ac589-860f-4dc7-aaf6-1ae23bd291bc',
      apiEndpoint: import.meta.env.VITE_API_URL || ''
    };
  }
}

export function clearConfigCache() {
  cachedConfig = null;
}
