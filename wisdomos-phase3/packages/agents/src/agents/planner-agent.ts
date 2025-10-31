/**
 * Planner Agent
 * Convert goals into DAG of tasks with dependencies, SLAs, owners (human or agent)
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope, TaskDefinition, PlanDefinition, AgentType } from '../types/contracts';
import { EventTypes } from '../types/contracts';
import { v4 as uuidv4 } from 'uuid';

export interface PlanningContext {
  objective: string;
  constraints: Record<string, any>;
  currentState: Record<string, any>;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TaskDependencyGraph {
  tasks: TaskDefinition[];
  edges: Array<{ from: string; to: string }>;
  criticalPath: string[];
}

export class PlannerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'PlannerAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `PlannerAgent handling: ${message.task}`);

    // Handle plan generation
    if (message.intent === 'plan' && message.task.includes('generate_plan')) {
      await this.generatePlan(message.payload as PlanningContext);
    }

    // Handle task decomposition
    if (message.intent === 'plan' && message.task.includes('decompose_task')) {
      await this.decomposeTask(message.payload as { task: string; context: Record<string, any> });
    }
  }

  /**
   * Generate a complete plan from objective
   */
  async generatePlan(context: PlanningContext): Promise<PlanDefinition> {
    const { objective, constraints, currentState, deadline, priority } = context;

    await this.log('info', `Generating plan for objective: ${objective}`);

    // 1. Analyze objective and break down into high-level tasks
    const highlevelTasks = await this.analyzeObjective(objective, constraints);

    // 2. Decompose high-level tasks into atomic tasks
    const atomicTasks: TaskDefinition[] = [];

    for (const hlTask of highlevelTasks) {
      const decomposed = await this.decomposeTask({
        task: hlTask.description,
        context: currentState,
      });

      atomicTasks.push(...decomposed);
    }

    // 3. Determine dependencies
    const tasksWithDeps = await this.linkDependencies(atomicTasks, currentState);

    // 4. Perform topological sort to create execution order
    const orderedTasks = this.topologicalSort(tasksWithDeps);

    // 5. Assign owners (human or agent)
    const tasksWithOwners = orderedTasks.map((task) => ({
      ...task,
      owner: this.assignOwner(task),
    }));

    // 6. Estimate completion times and set SLAs
    const tasksWithEstimates = await this.estimateTasks(tasksWithOwners, deadline);

    // 7. Create plan
    const plan: PlanDefinition = {
      plan_id: uuidv4(),
      objective,
      constraints,
      state: currentState,
      tasks: tasksWithEstimates,
      created_at: new Date().toISOString(),
      created_by: 'PlannerAgent',
    };

    // 8. Save plan
    await this.savePlan(plan);

    // 9. Emit event
    await this.emitEvent(EventTypes.PLAN_CREATED, {
      plan_id: plan.plan_id,
      task_count: plan.tasks.length,
      objective,
    });

    // 10. Schedule tasks in queue
    await this.scheduleTasks(plan);

    await this.log('info', `Plan generated: ${plan.tasks.length} tasks`, { plan_id: plan.plan_id });

    return plan;
  }

  /**
   * Analyze objective and create high-level tasks
   */
  private async analyzeObjective(
    objective: string,
    constraints: Record<string, any>
  ): Promise<Array<{ description: string; category: string }>> {
    await this.log('debug', 'Analyzing objective', { objective });

    // In production: Use LLM to analyze objective
    // For now, simple pattern matching

    const tasks: Array<{ description: string; category: string }> = [];

    if (objective.toLowerCase().includes('deploy')) {
      tasks.push(
        { description: 'Setup infrastructure', category: 'infrastructure' },
        { description: 'Deploy database', category: 'database' },
        { description: 'Deploy application', category: 'application' },
        { description: 'Verify deployment', category: 'verification' }
      );
    } else if (objective.toLowerCase().includes('implement')) {
      tasks.push(
        { description: 'Design solution', category: 'design' },
        { description: 'Implement code', category: 'development' },
        { description: 'Write tests', category: 'testing' },
        { description: 'Deploy to production', category: 'deployment' }
      );
    } else {
      // Generic breakdown
      tasks.push(
        { description: 'Research requirements', category: 'research' },
        { description: 'Plan approach', category: 'planning' },
        { description: 'Execute tasks', category: 'execution' },
        { description: 'Validate results', category: 'validation' }
      );
    }

    return tasks;
  }

  /**
   * Decompose a task into atomic subtasks
   */
  async decomposeTask(payload: { task: string; context: Record<string, any> }): Promise<TaskDefinition[]> {
    const { task, context } = payload;

    await this.log('debug', 'Decomposing task', { task });

    // In production: Use LLM for task decomposition
    // For now, create basic atomic tasks

    const taskId = uuidv4();

    const atomicTask: TaskDefinition = {
      task_id: taskId,
      definition_of_done: [
        'Task completed successfully',
        'Tests pass',
        'Documentation updated',
      ],
      owner: 'human', // Will be reassigned later
      estimate_hours: 2,
      inputs: { task_description: task, context },
      outputs: { result: 'completion_status' },
      tests: ['Verify completion', 'Check quality'],
      dependencies: [],
    };

    return [atomicTask];
  }

  /**
   * Link dependencies between tasks
   */
  private async linkDependencies(
    tasks: TaskDefinition[],
    context: Record<string, any>
  ): Promise<TaskDefinition[]> {
    await this.log('debug', 'Linking task dependencies');

    // In production: Use dependency analysis and context
    // For now, simple sequential dependencies

    for (let i = 1; i < tasks.length; i++) {
      tasks[i].dependencies = [tasks[i - 1].task_id];
    }

    return tasks;
  }

  /**
   * Topological sort of tasks (Kahn's algorithm)
   */
  private topologicalSort(tasks: TaskDefinition[]): TaskDefinition[] {
    // Build adjacency list
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    tasks.forEach((task) => {
      graph.set(task.task_id, []);
      inDegree.set(task.task_id, 0);
    });

    tasks.forEach((task) => {
      task.dependencies.forEach((depId) => {
        graph.get(depId)?.push(task.task_id);
        inDegree.set(task.task_id, (inDegree.get(task.task_id) || 0) + 1);
      });
    });

    // Kahn's algorithm
    const queue: string[] = [];
    const sorted: string[] = [];

    inDegree.forEach((degree, taskId) => {
      if (degree === 0) queue.push(taskId);
    });

    while (queue.length > 0) {
      const taskId = queue.shift()!;
      sorted.push(taskId);

      graph.get(taskId)?.forEach((dependentId) => {
        const newDegree = (inDegree.get(dependentId) || 0) - 1;
        inDegree.set(dependentId, newDegree);
        if (newDegree === 0) queue.push(dependentId);
      });
    }

    // Map sorted IDs back to tasks
    const taskMap = new Map(tasks.map((t) => [t.task_id, t]));
    return sorted.map((id) => taskMap.get(id)!);
  }

  /**
   * Assign owner (human or agent) based on task characteristics
   */
  private assignOwner(task: TaskDefinition): 'human' | AgentType {
    // In production: Use ML model to assign optimal owner
    // For now, simple rules

    const taskStr = JSON.stringify(task).toLowerCase();

    if (taskStr.includes('database') || taskStr.includes('schema')) {
      return 'DatabaseAgent';
    }

    if (taskStr.includes('security') || taskStr.includes('encrypt')) {
      return 'SecurityAgent';
    }

    if (taskStr.includes('journal') || taskStr.includes('entry')) {
      return 'JournalAgent';
    }

    if (taskStr.includes('score') || taskStr.includes('rollup')) {
      return 'FulfilmentAgent';
    }

    if (taskStr.includes('finance') || taskStr.includes('transaction')) {
      return 'FinanceAgent';
    }

    if (taskStr.includes('analytics') || taskStr.includes('kpi')) {
      return 'AnalyticsAgent';
    }

    // Default to human for complex or ambiguous tasks
    return 'human';
  }

  /**
   * Estimate task completion times
   */
  private async estimateTasks(
    tasks: TaskDefinition[],
    deadline?: string
  ): Promise<TaskDefinition[]> {
    await this.log('debug', 'Estimating task completion times');

    // In production: Use historical data and ML for estimates
    // For now, assign based on task complexity

    return tasks.map((task) => {
      // Estimate based on dependencies and owner
      let estimate = 2; // Base estimate in hours

      if (task.dependencies.length > 2) estimate += 1;
      if (task.owner === 'human') estimate *= 1.5; // Humans are slower but more thorough

      return {
        ...task,
        estimate_hours: estimate,
      };
    });
  }

  /**
   * Schedule tasks in the queue
   */
  private async scheduleTasks(plan: PlanDefinition): Promise<void> {
    await this.log('info', `Scheduling ${plan.tasks.length} tasks`);

    for (const task of plan.tasks) {
      // Calculate run_at based on dependencies
      const runAt = await this.calculateRunAt(task, plan);

      // Insert into queue_jobs
      await this.scheduleJob({
        agent: task.owner === 'human' ? 'Orchestrator' : (task.owner as AgentType),
        intent: 'execute',
        payload: {
          plan_id: plan.plan_id,
          ...task,
        },
        run_at: runAt,
        dependencies: task.dependencies,
      });
    }

    await this.log('info', 'All tasks scheduled');
  }

  /**
   * Calculate when a task should run based on dependencies
   */
  private async calculateRunAt(task: TaskDefinition, plan: PlanDefinition): Promise<string> {
    if (task.dependencies.length === 0) {
      // No dependencies, run immediately
      return new Date().toISOString();
    }

    // In production: Calculate based on estimated completion of dependencies
    // For now, schedule after a delay
    const delayMinutes = task.dependencies.length * 5;
    return new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
  }

  /**
   * Calculate critical path through the task graph
   */
  async calculateCriticalPath(graph: TaskDependencyGraph): Promise<string[]> {
    await this.log('debug', 'Calculating critical path');

    // In production: Implement critical path method (CPM)
    // For now, return longest dependency chain

    return [];
  }

  // Database helper methods (stubs)

  private async savePlan(plan: PlanDefinition): Promise<void> {
    await this.log('debug', 'Saving plan', { plan_id: plan.plan_id });
    // In production: INSERT INTO fd_plans and fd_plan_tasks
  }

  private async scheduleJob(job: any): Promise<void> {
    await this.log('debug', 'Scheduling job', { agent: job.agent });
    // In production: INSERT INTO queue_jobs
  }
}
