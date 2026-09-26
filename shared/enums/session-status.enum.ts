/** Состояние входа */
export enum SessionStatusEnum {
  /** Учётные данные не заданы */
  IDLE = 'IDLE',
  /** Проверяем форму */
  LOADING = 'LOADING',
  /** Можно открывать чат */
  READY = 'READY',
  /** Форма не прошла проверку */
  ERROR = 'ERROR',
}
