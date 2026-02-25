import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGetFarms, apiLogin } from "@/lib/murimi-api";
import {
  clearAuthSession,
  getAccessToken,
  getActiveFarmId,
  getApiBaseUrl,
  setActiveFarmId,
  setApiBaseUrl,
  setAuthTokens,
} from "@/lib/murimi-session";

export default function Settings() {
  const [apiBaseUrl, setApiBaseUrlInput] = useState(getApiBaseUrl());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savedFarmId, setSavedFarmId] = useState(getActiveFarmId());
  const [savedToken, setSavedToken] = useState(Boolean(getAccessToken()));

  const loginMutation = useMutation({
    mutationFn: async () => {
      setApiBaseUrl(apiBaseUrl);
      return apiLogin(email, password);
    },
    onSuccess: (data) => {
      setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      setSavedToken(true);
    },
  });

  const farmsQuery = useQuery({
    queryKey: ["murimi-farms", savedToken],
    queryFn: apiGetFarms,
    enabled: savedToken,
  });

  useEffect(() => {
    if (!savedFarmId && farmsQuery.data?.length) {
      const firstFarmId = farmsQuery.data[0].farm.id;
      setActiveFarmId(firstFarmId);
      setSavedFarmId(firstFarmId);
    }
  }, [farmsQuery.data, savedFarmId]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Backend connection, login, and active farm context for the frontend.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backend Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="apiBaseUrl">API Base URL</Label>
            <Input
              id="apiBaseUrl"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrlInput(e.target.value)}
              placeholder="http://localhost:3001/api"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setApiBaseUrl(apiBaseUrl);
            }}
          >
            Save API URL
          </Button>
          <p className="text-xs text-muted-foreground">
            Current: <code>{getApiBaseUrl()}</code>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auth Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={() => loginMutation.mutate()} disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearAuthSession();
                setSavedToken(false);
                setSavedFarmId("");
              }}
            >
              Clear Session
            </Button>
          </div>
          {loginMutation.error && (
            <p className="text-sm text-destructive">
              {(loginMutation.error as Error).message}
            </p>
          )}
          <Badge variant={savedToken ? "default" : "outline"}>
            {savedToken ? "Access token saved" : "No token saved"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Farm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={savedFarmId || undefined}
            onValueChange={(value) => {
              setActiveFarmId(value);
              setSavedFarmId(value);
            }}
            disabled={!farmsQuery.data?.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select farm after login" />
            </SelectTrigger>
            <SelectContent>
              {(farmsQuery.data ?? []).map((m) => (
                <SelectItem key={m.farm.id} value={m.farm.id}>
                  {m.farm.name} ({m.role.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {farmsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading farms...</p>}
          {farmsQuery.error && (
            <p className="text-sm text-destructive">{(farmsQuery.error as Error).message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Current farm header (`x-farm-id`): <code>{savedFarmId || "not set"}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
