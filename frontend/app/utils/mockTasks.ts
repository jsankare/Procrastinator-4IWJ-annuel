export interface MockTask {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: string;
    columnName: string; // The designated column name for this task
    columnId?: string;
    workspaceId?: string;
    assignedTo?: string;
    priority: "low" | "medium" | "high";
    user?: { firstName: string; lastName: string } | null;
}

export interface TaskColumn {
    id: string;
    name: string;
    color: string;
    tasks: MockTask[];
}

// Task templates with designated columns
const TASK_TEMPLATES = [
    {
        title: "Réviser la documentation",
        description: "Mettre à jour la documentation technique",
        columnName: "À faire",
    },
    {
        title: "Corriger les bugs critiques",
        description: "Résoudre les problèmes signalés par les utilisateurs",
        columnName: "En cours",
    },
    {
        title: "Préparer la présentation",
        description: "Créer les slides pour la réunion client",
        columnName: "À faire",
    },
    {
        title: "Tester les nouvelles fonctionnalités",
        description: "Effectuer des tests d'acceptance",
        columnName: "En révision",
    },
    {
        title: "Optimiser les performances",
        description: "Améliorer les temps de chargement",
        columnName: "En cours",
    },
    {
        title: "Faire le code review",
        description: "Examiner les pull requests en attente",
        columnName: "En révision",
    },
    {
        title: "Planifier le sprint",
        description: "Définir les objectifs de la prochaine itération",
        columnName: "À faire",
    },
    {
        title: "Analyser les métriques",
        description: "Étudier les données d'usage de l'application",
        columnName: "En cours",
    },
    {
        title: "Rédiger les tests unitaires",
        description: "Couvrir les nouvelles fonctionnalités",
        columnName: "À faire",
    },
    {
        title: "Mettre à jour les dépendances",
        description: "Upgrade des packages npm",
        columnName: "Maintenance",
    },
    {
        title: "Configurer l'environnement",
        description: "Préparer l'environnement de staging",
        columnName: "DevOps",
    },
    {
        title: "Refactoriser le code legacy",
        description: "Nettoyer l'ancien code",
        columnName: "Technique",
    },
    {
        title: "Implémenter l'API",
        description: "Développer les endpoints REST",
        columnName: "Développement",
    },
    {
        title: "Designer l'interface",
        description: "Créer les maquettes UI/UX",
        columnName: "Design",
    },
    {
        title: "Optimiser la base de données",
        description: "Améliorer les requêtes SQL",
        columnName: "Technique",
    },
    {
        title: "Écrire la documentation",
        description: "Documenter les nouvelles fonctionnalités",
        columnName: "Documentation",
    },
    {
        title: "Formation équipe",
        description: "Former l'équipe sur les nouvelles technologies",
        columnName: "Formation",
    },
    {
        title: "Audit sécurité",
        description: "Vérifier la sécurité de l'application",
        columnName: "Sécurité",
    },
    {
        title: "Déploiement production",
        description: "Mettre en production la nouvelle version",
        columnName: "Déploiement",
    },
    {
        title: "Collecte feedback",
        description: "Recueillir les retours utilisateurs",
        columnName: "Terminé",
    },
];

const STATUSES = ["À faire", "En cours", "Terminé", "En révision", "Bloqué"];
const PRIORITIES: ("low" | "medium" | "high")[] = ["low", "medium", "high"];

// Default column configurations with colors
const COLUMN_CONFIGS = {
    "À faire": "#64748b",
    "En cours": "#f59e0b",
    "En révision": "#8b5cf6",
    Terminé: "#10b981",
    Bloqué: "#ef4444",
    Développement: "#3b82f6",
    Design: "#ec4899",
    Technique: "#6366f1",
    DevOps: "#06b6d4",
    Maintenance: "#84cc16",
    Documentation: "#f97316",
    Formation: "#8b5cf6",
    Sécurité: "#dc2626",
    Déploiement: "#059669",
    "Sans colonne": "#6b7280",
};

/**
 * Generate mock tasks for workspace
 */
export function generateMockTasksForWorkspace(
    workspaceId: string,
    workspaceColumns: Array<{ _id: string; name: string }>,
    options: { minTasks?: number; maxTasks?: number } = {},
): MockTask[] {
    const { minTasks = 1, maxTasks = 4 } = options;
    const tasks: MockTask[] = [];
    const totalTasks =
        Math.floor(
            Math.random() * (maxTasks * workspaceColumns.length - minTasks + 1),
        ) + minTasks;

    for (let i = 0; i < totalTasks; i++) {
        const template =
            TASK_TEMPLATES[Math.floor(Math.random() * TASK_TEMPLATES.length)];
        const priority =
            PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
        const workspaceColumn =
            workspaceColumns[
                Math.floor(Math.random() * workspaceColumns.length)
            ];

        tasks.push({
            id: `workspace-${workspaceId}-task-${i}-${Date.now()}`,
            title: template.title,
            description: template.description,
            dueDate: getRandomFutureDate(14), // Within 2 weeks
            status: template.columnName, // Use the task's designated column
            columnName: template.columnName, // The task wants this column
            columnId: workspaceColumn._id, // Fallback to workspace column if needed
            workspaceId: workspaceId,
            priority,
            assignedTo: undefined,
            user: null,
        });
    }

    return tasks;
}

/**
 * Generate mock tasks for a user across all workspaces
 */
export function generateMockTasksForUser(
    userId: string,
    workspaceIds: string[] = [],
    options: { totalTasks?: number } = {},
): MockTask[] {
    const { totalTasks = 12 } = options;
    const tasks: MockTask[] = [];

    for (let i = 0; i < totalTasks; i++) {
        const template =
            TASK_TEMPLATES[Math.floor(Math.random() * TASK_TEMPLATES.length)];
        const priority =
            PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
        const workspaceId =
            workspaceIds.length > 0
                ? workspaceIds[Math.floor(Math.random() * workspaceIds.length)]
                : undefined;

        tasks.push({
            id: `user-${userId}-task-${i}-${Date.now()}-${Math.random()}`,
            title: template.title,
            description: template.description,
            dueDate: getRandomDateRange(-7, 21), // From 1 week ago to 3 weeks ahead
            status: template.columnName, // Use template's designated column as status
            columnName: template.columnName, // Task's designated column
            columnId: undefined, // Will be determined dynamically
            workspaceId: workspaceId,
            assignedTo: userId,
            priority,
            user: null,
        });
    }

    return tasks.sort((a, b) => {
        // Sort by priority and due date
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff =
            priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
}

/**
 * Get a random date in the future (days from now)
 */
function getRandomFutureDate(maxDays: number): string {
    const today = new Date();
    const futureDate = new Date(
        today.getTime() + Math.random() * maxDays * 24 * 60 * 60 * 1000,
    );
    return futureDate.toISOString().split("T")[0];
}

/**
 * Get a random date within a range
 */
function getRandomDateRange(minDays: number, maxDays: number): string {
    const today = new Date();
    const randomDays =
        Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    const targetDate = new Date(
        today.getTime() + randomDays * 24 * 60 * 60 * 1000,
    );
    return targetDate.toISOString().split("T")[0];
}

/**
 * Organize tasks into dynamic columns based on their designated columns
 */
export function organizeTasksIntoColumns(tasks: MockTask[]): TaskColumn[] {
    // Get all unique column names from tasks
    const columnNames = [...new Set(tasks.map((task) => task.columnName))];

    // Create columns with tasks
    const columns: TaskColumn[] = columnNames.map((columnName) => ({
        id: columnName.toLowerCase().replace(/\s+/g, "-"),
        name: columnName,
        color: COLUMN_CONFIGS[columnName] || COLUMN_CONFIGS["Sans colonne"],
        tasks: tasks.filter((task) => task.columnName === columnName),
    }));

    // Sort columns by priority (common ones first)
    const columnOrder = [
        "À faire",
        "En cours",
        "En révision",
        "Terminé",
        "Bloqué",
    ];

    return columns.sort((a, b) => {
        const aIndex = columnOrder.indexOf(a.name);
        const bIndex = columnOrder.indexOf(b.name);

        // If both are in the priority list, sort by priority
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        // Priority columns come first
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        // Alphabetical for custom columns
        return a.name.localeCompare(b.name);
    });
}

/**
 * Organize tasks into workspace columns, with fallback for unmatched tasks
 */
export function organizeTasksIntoWorkspaceColumns(
    tasks: MockTask[],
    workspaceColumns: Array<{ _id: string; name: string; color: string }>,
): Array<{ _id: string; name: string; color: string; tasks: MockTask[] }> {
    const result = workspaceColumns.map((column) => ({
        ...column,
        tasks: tasks.filter((task) => task.columnName === column.name),
    }));

    // Add "Sans colonne" for tasks that don't match any workspace column
    const unmatchedTasks = tasks.filter(
        (task) => !workspaceColumns.some((col) => col.name === task.columnName),
    );

    if (unmatchedTasks.length > 0) {
        result.push({
            _id: "sans-colonne",
            name: "Sans colonne",
            color: COLUMN_CONFIGS["Sans colonne"],
            tasks: unmatchedTasks,
        });
    }

    return result.filter((col) => col.tasks.length > 0); // Only return columns with tasks
}

/**
 * Filter mock tasks by status/column
 */
export function filterTasksByStatus(
    tasks: MockTask[],
    status: string,
): MockTask[] {
    return tasks.filter(
        (task) => task.status.toLowerCase() === status.toLowerCase(),
    );
}

/**
 * Get task statistics
 */
export function getTaskStats(tasks: MockTask[]) {
    return {
        total: tasks.length,
        completed: tasks.filter((t) =>
            t.columnName.toLowerCase().includes("terminé"),
        ).length,
        inProgress: tasks.filter((t) =>
            t.columnName.toLowerCase().includes("cours"),
        ).length,
        todo: tasks.filter((t) => t.columnName.toLowerCase().includes("faire"))
            .length,
        blocked: tasks.filter((t) =>
            t.columnName.toLowerCase().includes("bloqué"),
        ).length,
        review: tasks.filter((t) =>
            t.columnName.toLowerCase().includes("révision"),
        ).length,
        overdue: tasks.filter((t) => {
            const today = new Date().toISOString().split("T")[0];
            return (
                t.dueDate < today &&
                !t.columnName.toLowerCase().includes("terminé")
            );
        }).length,
    };
}
