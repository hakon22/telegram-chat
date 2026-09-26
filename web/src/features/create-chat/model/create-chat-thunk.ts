import * as yup from 'yup';

import { ChatFormDto } from '@shared/dto/chat/chat-form.dto';

import { chatCreated, createPendingSet } from '@web/entities/chat/model/chats-slice';

import type { AppThunkInterface } from '@web/store/index';

export const submitCreateChat = (rawPhone: string): AppThunkInterface<Promise<string>> => {
  return async dispatch => {
    dispatch(createPendingSet(true));
    try {
      const parsed = ChatFormDto.parseSync({
        phone: rawPhone,
      });
      dispatch(chatCreated(parsed.phone));
      return parsed.phone;
    } catch (error) {
      dispatch(createPendingSet(false));
      if (error instanceof yup.ValidationError) {
        throw new Error(error.errors[0] ?? error.message);
      }
      throw error;
    }
  };
};
