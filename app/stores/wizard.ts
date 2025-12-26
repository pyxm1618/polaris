/**
 * 向导状态管理 Store
 * 管理目标拆解向导的完整状态
 */

import { defineStore } from 'pinia'

export interface WizardDraft {
    northStar: {
        title: string
        year: number
    } | null
    goals: Array<{
        tempId: string
        title: string
        targetDate: string
        reason?: string
    }>
    projects: Array<{
        tempId: string
        name: string
        primaryDomain: string
        description?: string
        goalIds: string[]
    }>
    tasks: Array<{
        projectId: string
        name: string
        domain: string
        estimatedHours: number
        sequenceOrder: number
    }>
    preferences: {
        weeklyHoursLimit: number
        maxParallelProjects: number
        granularityPreference: 'day' | 'week' | 'session'
    }
}

export const useWizardStore = defineStore('wizard', {
    state: () => ({
        currentStep: 1,
        totalSteps: 5,
        isLoading: false,
        draft: null as WizardDraft | null,
        hasDraft: false,
    }),

    actions: {
        /**
         * 初始化：检查并加载草稿
         */
        async init() {
            try {
                const { draft } = await $fetch('/api/wizard/draft')

                if (draft) {
                    this.hasDraft = true
                    this.draft = draft.data
                    this.currentStep = draft.currentStep
                } else {
                    this.resetDraft()
                }
            } catch (error) {
                console.error('[Wizard Init Error]', error)
                this.resetDraft()
            }
        },

        /**
         * 重置为新的草稿
         */
        resetDraft() {
            this.draft = {
                northStar: null,
                goals: [],
                projects: [],
                tasks: [],
                preferences: {
                    weeklyHoursLimit: 40,
                    maxParallelProjects: 3,
                    granularityPreference: 'day'
                }
            }
            this.currentStep = 1
            this.hasDraft = false
        },

        /**
         * 继续草稿
         */
        async continueDraft() {
            // 已加载，无需额外操作
            this.hasDraft = false
        },

        /**
         * 删除草稿并重新开始
         */
        async deleteDraftAndRestart() {
            try {
                await $fetch('/api/wizard/draft', { method: 'DELETE' })
                this.resetDraft()
            } catch (error) {
                console.error('[Delete Draft Error]', error)
            }
        },

        /**
         * 保存草稿
         */
        async saveDraft() {
            if (!this.draft) return

            try {
                await $fetch('/api/wizard/draft', {
                    method: 'PUT',
                    body: {
                        currentStep: this.currentStep,
                        data: this.draft
                    }
                })
            } catch (error) {
                console.error('[Save Draft Error]', error)
            }
        },

        /**
         * 前进到下一步
         */
        async nextStep() {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++
                await this.saveDraft()
            }
        },

        /**
         * 返回上一步
         */
        async prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--
                await this.saveDraft()
            }
        },

        /**
         * 跳转到指定步骤
         */
        async goToStep(step: number) {
            if (step >= 1 && step <= this.totalSteps) {
                this.currentStep = step
                await this.saveDraft()
            }
        },

        /**
         * 完整保存并完成向导
         */
        async finalSave() {
            if (!this.draft || !this.draft.northStar) {
                throw new Error('数据不完整')
            }

            this.isLoading = true

            try {
                const { northStarId } = await $fetch('/api/wizard/save', {
                    method: 'POST',
                    body: {
                        northStar: this.draft.northStar,
                        goals: this.draft.goals,
                        projects: this.draft.projects,
                        tasks: this.draft.tasks
                    }
                })

                // 清除本地状态
                this.resetDraft()

                return northStarId
            } finally {
                this.isLoading = false
            }
        }
    }
})
