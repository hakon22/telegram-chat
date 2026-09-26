/** Цитата (ответ на сообщение) для отображения и отправки */
export interface MessageQuoteInterface {
  /** idMessage цитируемого сообщения в GREEN-API */
  idMessage: string;
  /** Имя или подпись автора в превью */
  authorName: string;
  /** Текст цитаты (укороченный) */
  text: string;
  /** Цитируемое сообщение исходящее (от вас) */
  outgoing: boolean;
}
