export interface Toast {
    id: number
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration?: number
}

export const useToast = () => {
    const toasts = useState<Toast[]>('toasts', () => [])

    const add = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
        const id = Date.now()
        toasts.value.push({ id, message, type, duration })

        if (duration > 0) {
            setTimeout(() => {
                remove(id)
            }, duration)
        }
    }

    const remove = (id: number) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    return {
        toasts,
        add,
        remove,
        success: (msg: string, duration?: number) => add(msg, 'success', duration),
        error: (msg: string, duration?: number) => add(msg, 'error', duration),
        info: (msg: string, duration?: number) => add(msg, 'info', duration),
        warning: (msg: string, duration?: number) => add(msg, 'warning', duration)
    }
}
