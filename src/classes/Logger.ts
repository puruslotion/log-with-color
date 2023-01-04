import { BackgroundColor } from "../enums/BackgroundColor";
import { ForegroundColor } from "../enums/ForegroundColor";
import { Style } from "../enums/Style";
import { Level } from "../enums/Level";
import { LogData } from "./LogData";
import '../string/string.extensions';
import { PrintOptions } from "../types/PrintOptions";
import { TagSet } from "../types/TagSet";
import { FieldSet } from "../types/FieldSet";

export class Logger {
    public static log(message: any, printOptions?: PrintOptions): string {
        let logString = `${printOptions?.timestampStyle ?? Style.Default}`
        let timestamp = ""

        if (!printOptions?.timestamp) timestamp = new Date().toISOString()

        logString += `${printOptions?.timestampStyle ?? Style.Default}${printOptions?.timestampBackgroundColor ?? BackgroundColor.Default}${printOptions?.timestampForegroundColor ?? ForegroundColor.Default}${printOptions?.timestamp ?? timestamp.replace(/T/gi, " ").replace(/Z/gi, " UTC")}${Style.Reset}`

        if (printOptions?.level) {
            logString += `  ${this.getLevel(printOptions.level)}`
        }

        if (printOptions?.tagSets) {
            logString += `  ${"Tags".green().reset()}[${Style.Reset}${this.tagsToString(printOptions.tagSets)}${Style.Reset}]`
        }

        if (printOptions?.fieldSets) {
            logString += `  ${"Fields".green().reset()}[${Style.Reset}${this.fieldsToString(printOptions.fieldSets)}${Style.Reset}]`
        }

        logString += `  ${"Message: ".green().reset()}${this.convertAnyToString(message)}`

        if (printOptions?.printToConsole) {
            process.stdout.write(`${this.resetString(logString)}\n`)
        }

        return new LogData(timestamp, Object.keys(Level)[Object.values(Level).indexOf(printOptions?.level ?? Level.Default)], message, printOptions?.measurement, printOptions?.tagSets, printOptions?.fieldSets).getInfluxDbLineProtocol()
    }

    private static tagsToString(tags: TagSet[]): string {
        return tags.map((tag) => {
            return `${tag.key.white().reset()}: ${tag.value.yellow().reset()}`
        }).join(", ")
    }

    private static fieldsToString(fields: FieldSet[]): string {
        return fields.map((field) => {
            if (typeof field.value === "number") {
                return `${field.key.white().reset()}: ${field.value.toString().magenta().reset()}`
            } else if (typeof field.value === "boolean") {
                return `${field.key.white().reset()}: ${field.value.toString().blue().reset()}`
            } 

            return `${field.key.white().reset()}: ${field.value.yellow().reset()}`
        }).join(", ")
    }
    public static resetString(text?: string) {
        return `${Style.Reset}${text}${Style.Reset}`
    }

    public static rainbowString(message: string) : string {
        let maxNumberOfForegroundColors = Object.keys(ForegroundColor).length - 3
        let rainbowText = ""

        for (let i = 0; i < message.length; i++) {
            rainbowText += Style.Bright
            rainbowText += `${Object.values(ForegroundColor)[(Math.floor(Math.random() * maxNumberOfForegroundColors)) + 1]}`
            rainbowText += message[i]
        }
        
        return this.resetString(rainbowText)
    }

    private static getLevel(level: Level): string {
        switch (level) {
            case Level.Information:
                return ` ${level} `.greenBg().black().reset()
            case Level.Warning:
                return ` ${level} `.yellowBg().black().reset()
            case Level.Error:
                return ` ${level} `.redBg().white().reset()
            case Level.Fatal:
                return ` ${level} `.magentaBg().white().reset()
            case Level.Debug:
                return ` ${level} `.blueBg().white().reset()
            default:
                return this.resetString("")
        }
    }

    public static convertAnyToString(error: any): string {
        if (typeof error === "object") {
            let message = JSON.stringify(error)

            if (message !== "{}") return message

            return JSON.stringify({
                name: error?.name,
                message: error?.message,
                stack: error?.stack,
                cause: error?.cause,
                fileName: error?.fileName,
                lineNumber: error?.lineNumber,
                columnNumber: error?.columnNumber,
            })
        } else if (typeof error === "undefined") {
            return "undefined"
        }

        return error.toString()
    }
}
