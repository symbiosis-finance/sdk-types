// Shared type only. `ProfilerItem` is part of the swap-result DTO (`timeLog?: ProfilerItem[]`
// in crosschain/types.ts), so the client receives it. The `Profiler` class itself is
// backend-only routing instrumentation and lives in the api core (api/src/core/entities/profiler.ts).
export interface ProfilerItem {
    name: string
    start: number
    stop: number
    duration?: number
}
