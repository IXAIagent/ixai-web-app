export type WorkspaceDatabaseReadSource =
  | "database"
  | "empty"
  | "error"
  | "local"
  | "truth";

export interface WorkspaceDatabaseReadPriorityResult<TData> {
  checkedAt: string;
  data: TData;
  errorMessage?: string;
  fallbackUsed: boolean;
  isDatabaseReady: boolean;
  source: WorkspaceDatabaseReadSource;
}

export interface WorkspaceDatabaseReadPriorityMetadata {
  checkedAt: string;
  errorMessage?: string;
  fallbackUsed: boolean;
  isDatabaseReady: boolean;
  source: WorkspaceDatabaseReadSource;
}

export interface WorkspaceDatabaseReadPriorityAttempt<TData> {
  emptyData: TData;
  hasData: (data: TData) => boolean;
  isDatabaseReady?: (data: TData) => boolean;
  read: () => Promise<TData> | TData;
}

export async function resolveDatabaseReadPriority<TData>(input: {
  database: WorkspaceDatabaseReadPriorityAttempt<TData>;
  local?: WorkspaceDatabaseReadPriorityAttempt<TData>;
  truth?: WorkspaceDatabaseReadPriorityAttempt<TData>;
}): Promise<WorkspaceDatabaseReadPriorityResult<TData>> {
  const checkedAt = new Date().toISOString();
  let databaseReady = false;
  let errorMessage: string | undefined;

  try {
    const databaseData = await input.database.read();
    databaseReady = input.database.isDatabaseReady?.(databaseData) ?? input.database.hasData(databaseData);

    if (input.database.hasData(databaseData)) {
      return {
        checkedAt,
        data: databaseData,
        fallbackUsed: false,
        isDatabaseReady: databaseReady,
        source: "database",
      };
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Database read failed safely.";
  }

  if (input.truth) {
    try {
      const truthData = await input.truth.read();

      if (input.truth.hasData(truthData)) {
        return {
          checkedAt,
          data: truthData,
          errorMessage,
          fallbackUsed: true,
          isDatabaseReady: databaseReady,
          source: "truth",
        };
      }
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? [errorMessage, error.message].filter(Boolean).join(" ")
          : errorMessage ?? "Truth fallback failed safely.";
    }
  }

  if (input.local) {
    try {
      const localData = await input.local.read();

      if (input.local.hasData(localData)) {
        return {
          checkedAt,
          data: localData,
          errorMessage,
          fallbackUsed: true,
          isDatabaseReady: databaseReady,
          source: "local",
        };
      }
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? [errorMessage, error.message].filter(Boolean).join(" ")
          : errorMessage ?? "Local fallback failed safely.";
    }
  }

  return {
    checkedAt,
    data: input.database.emptyData,
    errorMessage,
    fallbackUsed: Boolean(input.truth || input.local),
    isDatabaseReady: databaseReady,
    source: errorMessage ? "error" : "empty",
  };
}

export function hasArrayData<TItem>(items: TItem[]) {
  return items.length > 0;
}

export function getDatabaseReadPriorityMetadata<TData>(
  result: WorkspaceDatabaseReadPriorityResult<TData>,
): WorkspaceDatabaseReadPriorityMetadata {
  return {
    checkedAt: result.checkedAt,
    errorMessage: result.errorMessage,
    fallbackUsed: result.fallbackUsed,
    isDatabaseReady: result.isDatabaseReady,
    source: result.source,
  };
}
