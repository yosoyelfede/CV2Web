import { Vercel } from '@vercel/sdk'

export interface DeploymentConfig {
  name: string
  files: Array<{
    file: string
    data: string
  }>
  projectSettings?: {
    buildCommand?: string
    installCommand?: string
    outputDirectory?: string
  }
  target?: 'production' | 'preview'
}

export interface DeploymentResult {
  success: boolean
  deploymentId?: string
  url?: string
  error?: string
}

class VercelDeployer {
  private vercel: Vercel | null = null

  constructor() {
    const token = process.env.VERCEL_TOKEN
    if (token) {
      this.vercel = new Vercel({
        bearerToken: token,
      })
    }
  }

  async deployWebsite(config: DeploymentConfig): Promise<DeploymentResult> {
    try {
      if (!this.vercel) {
        return {
          success: false,
          error: 'Vercel token not configured'
        }
      }

      // Create deployment
      const deployment = await this.vercel.deployments.createDeployment({
        requestBody: {
          name: config.name,
          files: config.files,
          projectSettings: config.projectSettings || {
            buildCommand: undefined,
            installCommand: undefined,
            outputDirectory: undefined
          },
          target: config.target || 'preview',
          meta: {
            cv2w: 'true',
            generated: new Date().toISOString()
          }
        }
      })

      return {
        success: true,
        deploymentId: deployment.id,
        url: deployment.url
      }
    } catch (error) {
      console.error('Vercel deployment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error'
      }
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<{
    status: string
    url?: string
    error?: string
  }> {
    try {
      if (!this.vercel) {
        return {
          status: 'error',
          error: 'Vercel token not configured'
        }
      }

      const deployment = await this.vercel.deployments.getDeployment({
        idOrUrl: deploymentId
      })

      return {
        status: deployment.readyState || 'unknown',
        url: deployment.url
      }
    } catch (error) {
      console.error('Error getting deployment status:', error)
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async deleteDeployment(deploymentId: string): Promise<boolean> {
    try {
      if (!this.vercel) {
        return false
      }

      await this.vercel.deployments.deleteDeployment({
        id: deploymentId
      })

      return true
    } catch (error) {
      console.error('Error deleting deployment:', error)
      return false
    }
  }
}

export const vercelDeployer = new VercelDeployer() 