import { useEffect, useState } from 'react';

import { Motion } from '@/constants/theme';

/**
 * 숫자가 바뀔 때 이전 값에서 새 값까지 굴러가며 올라간다.
 *
 * 라이브러리 없이 requestAnimationFrame으로 돌린다. 웹·네이티브 둘 다 있고, 프레임마다 정수 하나만 바꾸면 된다.
 * @param target 도착할 값
 * @returns 지금 화면에 보일 값
 */
export const useCountUp = (target: number): number => {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const from = value;
    if (from === target) {
      return undefined;
    }
    const startedAt = Date.now();
    let frame = 0;

    /**
     * 한 프레임 진행. 끝에 가까울수록 느려지는 ease-out이라 마지막 자리가 또렷하게 멈춘다.
     */
    const tick = (): void => {
      const t = Math.min((Date.now() - startedAt) / Motion.count, 1);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);

    return (): void => cancelAnimationFrame(frame);
    // value는 시작점으로만 쓴다. 의존성에 넣으면 프레임마다 애니메이션이 다시 시작된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
};
