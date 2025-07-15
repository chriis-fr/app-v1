import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bot, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

interface AISettingsProps {
  organizationId?: string;
  currentSettings?: {
    isEnabled: boolean;
    allowPersonalAI: boolean;
    allowOrganizationAI: boolean;
  };
  onSettingsChange?: (settings: any) => void;
}

export function AISettings({ 
  organizationId, 
  currentSettings = {
    isEnabled: true,
    allowPersonalAI: true,
    allowOrganizationAI: true,
  },
  onSettingsChange 
}: AISettingsProps) {
  const [settings, setSettings] = useState(currentSettings);

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-blue-900">AI Assistant Settings</CardTitle>
            <p className="text-blue-700 text-sm">Control AI features for your organization</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main AI Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Settings className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <Label htmlFor="ai-enabled" className="text-sm font-semibold text-gray-900">
                Enable AI Assistant
              </Label>
              <p className="text-xs text-gray-600">
                Turn AI features on or off for the entire organization
              </p>
            </div>
          </div>
          <Switch
            id="ai-enabled"
            checked={settings.isEnabled}
            onCheckedChange={(checked) => handleSettingChange('isEnabled', checked)}
          />
        </div>

        {/* Organization AI */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <Label htmlFor="org-ai" className="text-sm font-semibold text-gray-900">
                Organization AI
              </Label>
              <p className="text-xs text-gray-600">
                Allow AI to access organization-wide data and provide insights
              </p>
            </div>
          </div>
          <Switch
            id="org-ai"
            checked={settings.allowOrganizationAI}
            onCheckedChange={(checked) => handleSettingChange('allowOrganizationAI', checked)}
            disabled={!settings.isEnabled}
          />
        </div>

        {/* Personal AI */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Bot className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <Label htmlFor="personal-ai" className="text-sm font-semibold text-gray-900">
                Personal AI Assistant
              </Label>
              <p className="text-xs text-gray-600">
                Allow employees to use AI for personal productivity tasks
              </p>
            </div>
          </div>
          <Switch
            id="personal-ai"
            checked={settings.allowPersonalAI}
            onCheckedChange={(checked) => handleSettingChange('allowPersonalAI', checked)}
            disabled={!settings.isEnabled}
          />
        </div>

        {/* Warning Message */}
        {!settings.isEnabled && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">AI Assistant Disabled</p>
              <p className="text-xs text-yellow-700">
                AI features are currently disabled for your organization. Enable AI to use the assistant.
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => console.log('Settings saved:', settings)}
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 