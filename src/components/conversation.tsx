'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMemos, searchMemos, saveMemo } from "@/lib/core/storage";
import { firstMessage, systemPrompt } from "@/lib/elevenlabs/config";
import { Role, useConversation } from '@11labs/react';
import { useCallback } from 'react';

export function Conversation() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'), 
    onMessage: (message: {
        message: string;
        source: Role;
    }) => {
        if (message.source === 'user') {
            console.log("user", message.message)
        } else {
            console.log("ai",message.message)
        }
    },
    onError: (error: any) => console.error('Error:', error),
    clientTools: {
        listMemos: async () => {
            const memos = getMemos()
          return JSON.stringify(memos.map((memo) => memo.name).join("\n"))
        },
        findMemo: async ({memo_name}: {memo_name: string}) => {
          return JSON.stringify(searchMemos(memo_name))
        },
        saveMemo: async ({name, content}: {name: string, content: string}) => {
          return JSON.stringify(saveMemo({
            content,
            name,
            memoId: crypto.randomUUID()
          }))
        },
        runMemo: async ({memo_name}: {memo_name: string}) => {
          const memo = searchMemos(memo_name)[0]
          if (!memo) {
            return "Memo not found"
          }

          return `
            Started executing memo ${JSON.stringify(memo)}
          `
        }
      },
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'SmaHfpnBVCDkYcXIxPVn',
        overrides: {
          agent: {
            prompt: {
              prompt: systemPrompt
            },
            firstMessage: firstMessage,
          },
          tts: {
            voiceId: "bIHbv24MWmeRgasZH58o"
          }
        },
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <Card className="w-full max-w-sm mx-auto bg-card border">
      <CardContent className="flex flex-col items-center p-4">
        <p className="font-mono text-xs uppercase tracking-wider">
          {conversation.status === 'connected' ? (
            conversation.isSpeaking ? (
              <span className="flex items-center">
                <span className="animate-pulse mr-2 text-red-500">◆</span>
                REC
              </span>
            ) : (
              <span className="flex items-center">
                <span className="animate-pulse mr-2 text-green-500">◆</span>
                LISTEN
              </span>
            )
          ) : (
            <span className="flex items-center">
              <span className="mr-2 text-muted-foreground">◆</span>
              STANDBY
            </span>
          )}
        </p>
        <Button
          onClick={conversation.status === 'connected' ? stopConversation : startConversation}
          variant="outline"
          size="sm"
          className="mt-4 w-16 h-16 rounded-full border-2 font-mono text-xs uppercase tracking-wider hover:bg-accent"
        >
          {conversation.status === 'connected' ? '[ ]' : '►'}
        </Button>
      </CardContent>
    </Card>
  );
}
