import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { MessageSquare, Plus, Search, Send, User, Clock } from 'lucide-react';

const mockTeacherConversations = [
  {
    id: 'MSG-T1',
    participant: 'Mrs. Grace Boateng (Guardian of Ama Boateng)',
    lastMessage: 'Thank you for the update on Ama’s science homework.',
    time: '10:30 AM',
    unread: false,
  },
  {
    id: 'MSG-T2',
    participant: 'Mr. Kwesi Mensah (Guardian of Kofi Mensah)',
    lastMessage: 'Kofi will be absent tomorrow for a scheduled medical checkup.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'MSG-T3',
    participant: 'School Administration Office',
    lastMessage: 'Reminder: Please finalize continuous assessment marks by 4 PM on Friday.',
    time: '2 days ago',
    unread: false,
  },
];

export default function TeacherMessagesPage() {
  const [conversations, setConversations] = useState(mockTeacherConversations);
  const [activeChat, setActiveChat] = useState(mockTeacherConversations[0]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Teacher Messaging & Inquiries"
          subtitle="Direct messaging channel with parents, guardians, and administration."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Left conversations list */}
        <div className="border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <Input placeholder="Search messages..." className="text-xs" />
          </div>
          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChat(c)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition flex items-start gap-3 ${
                  activeChat?.id === c.id ? 'bg-indigo-50/60' : ''
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {c.participant.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-900 truncate">{c.participant}</p>
                    <span className="text-[10px] text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right chat panel */}
        <div className="md:col-span-2 flex flex-col">
          {activeChat ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{activeChat.participant}</h4>
                  <p className="text-xs text-gray-400">Direct Parent/Staff Thread</p>
                </div>
              </div>
              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50/30">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-2xs border border-gray-200 max-w-md text-xs text-gray-800">
                    {activeChat.lastMessage}
                  </div>
                </div>
              </div>
              <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-xs flex-1"
                />
                <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

