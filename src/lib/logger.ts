import chalk from 'chalk'

const { blueBright, greenBright, redBright, yellowBright } = chalk

export enum LoggerLevel {
    ASSERT,
    INFO,
    ERROR,
    WARN,
}

export class Logger {
    public constructor() {}

    public static write(level: LoggerLevel, ...ctx: unknown[]) {
        const format = ` ${new Date().toISOString()}: ${ctx}`

        switch (level) {
            case LoggerLevel.ASSERT:
                console.log(greenBright('[ASSERT]') + format)
                break
            case LoggerLevel.INFO:
                console.info(blueBright('[INFO]') + format)
                break
            case LoggerLevel.ERROR:
                console.error(redBright('[ERROR]') + format)
                break
            case LoggerLevel.WARN:
                console.warn(yellowBright('[WARN]') + format)
        }
    }

    public static assert(...ctx: unknown[]) {
        this.write(LoggerLevel.ASSERT, ctx)
    }

    public static info(...ctx: unknown[]) {
        this.write(LoggerLevel.INFO, ctx)
    }

    public static warn(...ctx: unknown[]) {
        this.write(LoggerLevel.WARN, ctx)
    }

    public static error(...ctx: unknown[]) {
        this.write(LoggerLevel.ERROR, ctx)
    }
}
