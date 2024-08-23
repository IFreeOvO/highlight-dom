import { customAlphabet } from 'nanoid'
import 'requestidlecallback'

export interface Task {
    id: string
    interruptSchedule: () => void
    isInterrupt: boolean
}

export function makeHash(length: number = 6): string {
    const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
    const hash = nanoid(length)
    return hash
}

export function schedule(
    task: (...args: any[]) => void,
    canExec: (...args: any[]) => boolean,
    finished?: (...args: any[]) => void,
): Task {
    let isInterrupt = false
    const id = makeHash()
    requestIdleCallback(function (deadline) {
        let canExecFlag
        while (!isInterrupt && (canExecFlag = canExec()) && deadline.timeRemaining() > 0) {
            task()
        }
        if (canExecFlag) {
            schedule(task, canExec, finished)
        } else {
            if (!isInterrupt) {
                finished && finished()
            }
        }
    })

    return {
        isInterrupt,
        id,
        interruptSchedule() {
            isInterrupt = true
            this.isInterrupt = true
        },
    }
}
