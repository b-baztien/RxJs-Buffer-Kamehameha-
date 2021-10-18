import { EMPTY, fromEvent, interval, Observable, Subject } from 'rxjs';
import { buffer, catchError, filter, switchMap, tap } from 'rxjs/operators';

const goku = document.getElementById('goku') as HTMLImageElement;
const beam = document.getElementById('beam') as HTMLImageElement;
const aura = document.getElementById('aura') as HTMLImageElement;
const chargeSound = document.getElementById('charge-sound') as HTMLAudioElement;
const fireSound = document.getElementById('fire-sound') as HTMLAudioElement;

const kamehamehaCharge = (scale: number) => {
  goku.src =
    'https://raw.githubusercontent.com/devilbas07/pokemon/master/apps/pokemon-app/src/assets/goku-kamehameha-charge.png';
  goku.style.width = '100px';
  goku.style.height = '200px';

  aura.style.display = 'block';

  beam.src =
    'https://raw.githubusercontent.com/devilbas07/pokemon/master/apps/pokemon-app/src/assets/kamehameha-charge.png';
  beam.style.opacity = `${scale}`;
  beam.style.transform = `scale(${scale}) rotate(${scale * 100}deg)`;
  beam.style.transformOrigin = 'center';
  beam.style.rotate = `${scale * 10}`;
  beam.style.display = 'block';
  beam.style.right = '80px';
  beam.style.bottom = `260px`;
};

const kamehamehaBeam = (scale: number) => {
  goku.src =
    'https://raw.githubusercontent.com/devilbas07/pokemon/master/apps/pokemon-app/src/assets/goku-kamehameha-release.png';
  goku.style.width = '130px';

  beam.src =
    'https://github.com/devilbas07/pokemon/blob/master/apps/pokemon-app/src/assets/kamehameha-beam.gif?raw=true';
  beam.style.transformOrigin = `center right`;
  beam.style.right = `${100 + scale}px`;
  beam.style.transform = `scale(${scale}) rotate(0deg)`;
};

const releaseClicks = fromEvent(document, 'mouseup');
const chargeClicks = fromEvent(document, 'mousedown');
const intervalEvents = interval(100);
const charging$ = new Subject<number>();

const buffered = chargeClicks.pipe(
  switchMap(() => {
    return intervalEvents.pipe(
      filter((res) => res <= 20),
      tap((res) => {
        charging$.next(res);
      }),
      buffer(releaseClicks),
      firstWhenCustom((res) => {
        return res.length === 0 ? 0 : res.reduce((pNum, cNum) => pNum + cNum);
      }),
      catchError((err) => {
        console.error(err);
        return EMPTY;
      })
    );
  })
);

const playAudio = (type: 'charge' | 'fire') => {
  switch (type) {
    case 'charge': {
      if (chargeSound.paused) {
        fireSound.pause();
        chargeSound.currentTime = 0;
        chargeSound.pause();
        chargeSound.currentTime = 0;

        chargeSound.load();
        chargeSound.play();
      }
      break;
    }
    case 'fire': {
      if (fireSound.paused) {
        fireSound.pause();
        chargeSound.currentTime = 0;
        chargeSound.pause();
        chargeSound.currentTime = 0;

        fireSound.load();
        fireSound.play();
      }
      break;
    }
    default:
      return;
  }
};

const firstWhenCustom =
  <T, R>(mapFunction: (data: T) => R) =>
  (source: Observable<T>) =>
    new Observable<R>((observer) => {
      return source.subscribe((val) => {
        observer.next(mapFunction(val));
        observer.complete();
      });
    });

//main
charging$.subscribe((res) => {
  playAudio('charge');
  kamehamehaCharge(res / 10.0);
});

buffered.subscribe((x) => {
  playAudio('fire');
  kamehamehaBeam(x / 10);
});
