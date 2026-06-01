// =====================================================================
//  НАСТРОЙКА FIREBASE  (понадобится на шаге подключения синхронизации)
//  Firebase Console → Project settings → Your apps → SDK setup → Config.
//  Эти ключи НЕ секретные (они для клиента). Защиту дают правила Firestore.
// =====================================================================
export const firebaseConfig = {
  apiKey: "ВСТАВЬ_СЮДА",
  authDomain: "ТВОЙ_ПРОЕКТ.firebaseapp.com",
  projectId: "ТВОЙ_ПРОЕКТ",
  storageBucket: "ТВОЙ_ПРОЕКТ.appspot.com",
  messagingSenderId: "ВСТАВЬ_СЮДА",
  appId: "ВСТАВЬ_СЮДА",
};

// Общий ID вашего «домохозяйства» — любая длинная строка, одинаковая у обоих.
export const HOUSEHOLD_ID = "smeni-na-svoy-dlinnyy-id";
