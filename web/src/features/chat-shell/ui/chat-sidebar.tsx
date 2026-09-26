import {
  MenuOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Conversations } from '@ant-design/x';
import { Button, Dropdown, Form, Input, type InputRef } from 'antd';
import { isNil } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ChatFormDto, type ChatFormInterface } from '@shared/dto/chat/chat-form.dto';

import { activeChatSet } from '@web/entities/chat/model/chats-slice';
import { submitCreateChat } from '@web/features/create-chat/model/create-chat-thunk';
import { logout } from '@web/features/login/model/logout-thunk';
import { avatarColor, formatPhone } from '@web/shared/lib/format-phone';
import { formatMessageTime } from '@web/shared/lib/format-time';
import { dtoFormItemProps } from '@web/shared/lib/yup-dto-field-rules';
import { PhoneInput } from '@web/shared/ui/phone-input';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';

export interface ChatSidebarPropsInterface {
  creating: boolean;
  onCreatingChange: (creating: boolean) => void;
}

export const ChatSidebar = ({ creating, onCreatingChange }: ChatSidebarPropsInterface) => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector(state => state.chats.items);
  const activePhone = useAppSelector(state => state.chats.activePhone);
  const createPending = useAppSelector(state => state.chats.createPending);
  const [search, setSearch] = useState('');
  const phoneRef = useRef<InputRef>(null);

  useEffect(() => {
    if (!creating) {
      return;
    }

    phoneRef.current?.focus();
  }, [creating]);

  const items = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const digits = search.replace(/\D/g, '');

    return chats.filter(chat => {
      if (needle === '') {
        return true;
      }

      const title = formatPhone(chat.phone).toLowerCase();
      return title.includes(needle) || (digits !== '' && chat.phone.includes(digits));
    }).map(chat => {
      const last = chat.messages[chat.messages.length - 1];
      const title = formatPhone(chat.phone);

      return {
        key: chat.phone,
        label: (
          <span className="chat-row">
            <span className="chat-row__body">
              <span className="chat-row__top">
                <span className="chat-row__name">{title}</span>
                {!isNil(last) && (
                  <span className="chat-row__time">{formatMessageTime(last.createdAt)}</span>
                )}
              </span>
              <span className="chat-row__preview">
                <span className="chat-row__text">{isNil(last) ? 'Нет сообщений' : last.text}</span>
                {chat.unreadCount > 0 && (
                  <span className="chat-row__badge">{chat.unreadCount}</span>
                )}
              </span>
            </span>
          </span>
        ),
        icon: (
          <span className="chat-row__avatar" style={{ background: avatarColor(chat.phone) }}>
            <UserOutlined />
          </span>
        ),
      };
    });
  }, [chats, search]);

  const onCreate = (values: ChatFormInterface) => {
    dispatch(submitCreateChat(values.phone)).then(() => {
      onCreatingChange(false);
      setSearch('');
    }).catch(() => {
      return undefined;
    });
  };

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <Dropdown
          trigger={['click']}
          menu={{
            items: [{
              key: 'logout',
              label: 'Выйти',
              onClick: () => {
                dispatch(logout());
              },
            }],
          }}
        >
          <button type="button" className="sidebar__menu" aria-label="Меню">
            <MenuOutlined />
          </button>
        </Dropdown>
        <Input
          className="sidebar__search"
          prefix={<SearchOutlined />}
          placeholder="Поиск"
          allowClear
          value={search}
          onChange={event => {
            setSearch(event.target.value);
          }}
        />
        <button
          type="button"
          className="sidebar__new"
          aria-label="Новое сообщение"
          onClick={() => {
            onCreatingChange(true);
          }}
        >
          <PlusOutlined />
        </button>
      </header>
      {creating ? (
        <div className="sidebar__create">
          <div className="sidebar__create-title">Новое сообщение</div>
          <Form layout="vertical" requiredMark={false} onFinish={onCreate}>
            <Form.Item name="phone" {...dtoFormItemProps(ChatFormDto, 'phone')}>
              <PhoneInput ref={phoneRef} />
            </Form.Item>
            <div className="sidebar__actions">
              <Button type="primary" htmlType="submit" loading={createPending} block>
                Начать чат
              </Button>
              <Button
                type="text"
                block
                onClick={() => {
                  onCreatingChange(false);
                }}
              >
                Отмена
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        <div className="sidebar__list">
          {chats.length === 0 ? (
            <div className="sidebar__empty">
              <h2>Чатов нет</h2>
              <p className="sidebar__empty-hint">Начните переписку с новым номером</p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  onCreatingChange(true);
                }}
              >
                Начать общение
              </Button>
            </div>
          ) : (
            <Conversations
              className="sidebar__conversations"
              items={items}
              activeKey={activePhone}
              onActiveChange={key => {
                dispatch(activeChatSet(key));
              }}
            />
          )}
        </div>
      )}
    </aside>
  );
};
