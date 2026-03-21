# Tool Registration & Extension Guide (工具註冊與擴展指南)

This guide describes how to add a custom tool to the AI Ops Platform. Our system uses a dynamic dispatch mechanism, so adding tools does not require modification of the core reasoning loop.
(本指南說明如何為 AI Ops 平台新增自定義工具。本系統透過動態分發機制，新增工具不需要修改核心推理邏輯。)

---

## Step 1: Define OpenAI Function Structure (在 `tool-registry` 定義 OpenAI Function 結構)

File: `packages/tool-registry/src/index.ts`

Add your tool's JSON definition to the `agentTools` array:

```typescript
export const agentTools = [
  // ... existing tools
  {
    type: "function",
    function: {
      name: "restartService", // Tool name
      description: "Restart a specified service. Please use only when connection errors occur.",
      parameters: {
        type: "object",
        required: ["serviceName"],
        properties: {
          serviceName: { type: "string", description: "The name of the service" },
        },
      },
    },
  },
];
```

## Step 2: Implement Tool Logic (在 `backend` 實作工具邏輯)

File: `packages/backend/src/modules/agent/tools/tools.service.ts`

Add a **public method** to the `ToolsService` class with the same name as defined in Step 1. The system will automatically call this method.

```typescript
@Injectable()
export class ToolsService {
  /**
   * Method name MUST exactly match the function.name in Step 1
   */
  async restartService(args: { serviceName: string }) {
    this.logger.log(`Executing restart for: ${args.serviceName}`);
    // Implement actual restart logic (e.g., call K8s API)
    return { success: true, message: `Service ${args.serviceName} has been restarted.` };
  }
}
```

## Step 3: Configure Permissions (在 `AgentService` 設定 RBAC 權限)

File: `packages/backend/src/modules/agent/agent.service.ts`

Add the new tool name to the permitted role list in the `canAccessTool` method.

```typescript
private canAccessTool(role: UserRole, toolName: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ["restartService", /* ...Other tools */],
    operator: ["restartService", /* ...Other tools */],
    viewer: [/* Viewer role typically doesn't have restart permission */],
  };
  return (permissions[role] || []).includes(toolName);
}
```

---

## Important Considerations (注意事項)

1. **Parameter Matching (參數一致性)**: The structure of args in `ToolsService` must match the `parameters` defined in `agentTools`.
2. **Asynchronous Execution (非同步執行)**: Ensure the method is marked as `async`. The system automatically handles BullMQ dispatch.
3. **Error Handling (錯誤處理)**: Exceptions thrown by tools will be recorded as `failed` in audit logs. Return a JSON object with `success: false` and an error message to help the AI adjust its reasoning.
4. **Dry-run Support (預演模式)**: For tools that modify resources, confirm if the action is safe during `dryRun: true` mode. The AI generates the parameters but the tool method is not actually executed.
5. **Role-Based Execution (角色相關執行)**: User roles and Trace IDs are injected into the executor context for audit traceability.
