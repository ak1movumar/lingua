// 'use client';
// import { useState } from 'react';
// import { z } from 'zod';
// import { useAuth } from '@/features/auth/auth-provider';
// import { useI18n } from '@/providers/i18n-provider';
// import { friendshipMessages } from '@/i18n/friendship';
// import { Input } from '@/components/ui/field';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/surface';
// import { FriendActions } from './friend-actions';
// import styles from './social.module.scss';
// export function AddFriend() {
//   const { user } = useAuth();
//   const {
//     locale,
//     messages: { learning },
//   } = useI18n();
//   const t = friendshipMessages[locale];
//   const [value, setValue] = useState('');
//   const [id, setId] = useState('');
//   const [error, setError] = useState('');
//   return (
//     <Card className={styles.addFriend}>
//       <h2>{t.title}</h2>
//       <p>{t.hint}</p>
//       {user && (
//         <Input
//           label={t.myId}
//           value={user.id}
//           readOnly
//           onFocus={(event) => event.currentTarget.select()}
//         />
//       )}
//       <form
//         onSubmit={(event) => {
//           event.preventDefault();
//           const parsed = z.uuid().safeParse(value.trim().toLowerCase());
//           if (!parsed.success) {
//             setError(t.invalid);
//             return;
//           }
//           if (parsed.data === user?.id) {
//             setError(t.self);
//             return;
//           }
//           setError('');
//           setId(parsed.data);
//         }}
//       >
//         <Input
//           label={t.receiver}
//           value={value}
//           onChange={(event) => {
//             setValue(event.target.value);
//             setId('');
//             setError('');
//           }}
//           error={error}
//           autoComplete="off"
//           spellCheck={false}
//           required
//         />
//         <Button type="submit" disabled={!value.trim()}>
//           {learning.next}
//         </Button>
//       </form>
//       {id && <FriendActions key={id} id={id} showMessage={false} />}
//     </Card>
//   );
// }
