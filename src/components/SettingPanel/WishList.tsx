import { useState, useEffect } from 'preact/hooks';
import { Wish } from '@/types';
import styles from './index.module.scss';

export function WishList() {
  const [wishes, setWishes] = useState<Wish[]>([{ text: "Here's my wish" }]);

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [wishes]);

  const handleAddWish = () => {
    setWishes(() => [...wishes, { text: '' }]);
  };

  const handleRemoveWish = (wishText: string) => {
    const newWishes = [...wishes];
    const index = wishes.findIndex((w) => w.text === wishText);
    newWishes.splice(index, 1);
    setWishes(newWishes);
  };

  const handleChange = (index: number, e: any) => {
    const newWishes = [...wishes];
    newWishes[index] = { text: e.target.value };
    setWishes(newWishes);
  };

  return (
    <>
      <div>
        {wishes.map((wish, index) => (
          <div key={`${wish.text}-${index}`} className={styles.wishList}>
            <div>
              <input
                className={styles.wish}
                value={wish.text}
                onChange={(e) => handleChange(index, e)}
              />
              <button
                className={styles.removeWishButton}
                onClick={() => handleRemoveWish(wish.text)}
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleAddWish} className={styles.addWishButton}>
        +
      </button>
    </>
  );
}
