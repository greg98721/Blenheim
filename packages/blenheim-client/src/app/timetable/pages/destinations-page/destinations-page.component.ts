import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Airport } from '@blenheim/model';
import { CityNamePipe } from '../../../shared/pipes/city-name.pipe';

@Component({
  selector: 'app-destinations-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage , CityNamePipe],
  templateUrl: './destinations-page.component.html',
  styleUrl: './destinations-page.component.scss'
})
export class DestinationsPageComponent {

  // We could go the server to get the list of destinations dynamically - but if we hardcode them we can pre-compile the page and have it load quickly. Also destinations are reasonably static
  destinations: { code: Airport; fluff: string }[] = [
    { code: 'NZAA', fluff: DUMMY_TEXT[0] },
    { code: 'NZWB', fluff: DUMMY_TEXT[1] },
    { code: 'NZCI', fluff: DUMMY_TEXT[2] },
    { code: 'NZCH', fluff: DUMMY_TEXT[3] },
    { code: 'NZDN', fluff: DUMMY_TEXT[4] },
    { code: 'NZHK', fluff: DUMMY_TEXT[5] },
    { code: 'NZNR', fluff: DUMMY_TEXT[6] },
    { code: 'NZNS', fluff: DUMMY_TEXT[7] },
    { code: 'NZNP', fluff: DUMMY_TEXT[8] },
    { code: 'NZPM', fluff: DUMMY_TEXT[9] },
    { code: 'NZQN', fluff: DUMMY_TEXT[10] },
    { code: 'NZTG', fluff: DUMMY_TEXT[11] },
    { code: 'NZWN', fluff: DUMMY_TEXT[12] },
  ];
}

const DUMMY_TEXT = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce est enim, semper vitae pulvinar ac, euismod sit amet lacus. Pellentesque mauris neque, sagittis ut tempus id, congue eget urna. Vestibulum dictum imperdiet gravida. Nulla dapibus varius massa et ultricies. Vivamus vitae egestas leo, at dictum urna. Vestibulum nec fringilla est. Aenean non tempor odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec in gravida leo, vitae iaculis felis.',
  'Donec quis sagittis nisl. Fusce lorem nisi, volutpat at condimentum a, lacinia ut nibh. Aenean bibendum accumsan lacus quis efficitur. Mauris lobortis sem neque, sed elementum dui dapibus ut. Vivamus vulputate hendrerit tristique. Nullam et ipsum et quam placerat ornare eu non arcu. Aenean tincidunt, odio vel sollicitudin egestas, est eros placerat nisl, eget euismod massa eros a tellus. Fusce at ex quis mi rhoncus venenatis id sit amet dui. Suspendisse vehicula velit ac faucibus molestie. Vivamus facilisis euismod velit, quis tempor arcu. Nullam rutrum mauris arcu, ut mollis justo tempus at. Ut semper est ac tortor ullamcorper consequat. Vestibulum et fringilla libero.',
  'Nam luctus ligula non gravida pretium. Nullam vehicula, sapien et laoreet mollis, tellus nulla consectetur risus, eu posuere leo sapien ut eros. Nunc non lobortis dui. Pellentesque et est tristique, fringilla nibh vitae, maximus risus. Etiam eu purus pretium, faucibus sem sed, venenatis mi. Aliquam id neque auctor, consequat felis in, fringilla eros. Praesent non augue et leo aliquam pulvinar. Praesent faucibus sem et iaculis tempus.',
  'Pellentesque ac risus placerat, cursus orci a, tincidunt lorem. Suspendisse suscipit mauris id tortor condimentum, nec commodo arcu ultrices. Mauris fermentum finibus arcu. Quisque sed eros eleifend, maximus velit ac, venenatis metus. Mauris egestas arcu tempor lacus interdum suscipit. Nunc vitae lectus pulvinar, feugiat diam quis, feugiat magna. Morbi sed urna id ipsum volutpat interdum et sed lorem. Aliquam ut mollis justo, nec condimentum augue.',
  'Suspendisse quis viverra lectus, vel egestas turpis. Sed et magna lacus. Vivamus aliquet nisi ac ornare tincidunt. Duis lacinia pulvinar leo, sed facilisis orci mollis non. In ac tempus nisl, et tempor dui. Proin ut libero imperdiet, tristique quam vel, maximus neque. Vivamus ac felis ante. Cras tristique nec nisl eu dapibus. Praesent sollicitudin odio sed ipsum tristique aliquet. Vivamus facilisis enim magna. Maecenas et lorem a massa cursus finibus. Ut malesuada fermentum elementum.',
  'Morbi dignissim iaculis rutrum. Aenean sodales egestas ipsum. Fusce fringilla accumsan felis ac tincidunt. Pellentesque quis est at erat gravida iaculis. Donec id massa sed sapien tempor gravida. In hac habitasse platea dictumst. Phasellus ut dolor metus. Maecenas porta eu eros quis porta. Phasellus a sem non dolor bibendum euismod.',
  'Proin porta interdum nisl, ac egestas velit iaculis a. Nunc eget convallis turpis, eget tempus magna. Aenean posuere lorem vel lacus molestie eleifend. Morbi malesuada placerat gravida. Donec blandit congue mauris in blandit. Aliquam eu ligula metus. Aenean convallis, libero non aliquam tempor, orci felis cursus lectus, sit amet semper sapien sapien dapibus mauris. Mauris nec facilisis diam. Nulla sit amet magna ipsum. Mauris placerat accumsan justo mollis placerat. Aenean a feugiat sem.',
  'Phasellus nec nulla mattis, facilisis purus ac, pulvinar risus. In ac neque dui. Nullam suscipit nulla lacus, sed pellentesque lorem euismod sed. Vestibulum vulputate erat et dolor fringilla fermentum. Sed augue orci, tincidunt ac dolor et, sollicitudin commodo orci. Sed at bibendum diam. Fusce maximus ut est ut mattis. Phasellus quis posuere nunc, vitae blandit felis. Mauris placerat sit amet magna in sollicitudin. Fusce hendrerit tristique dolor. Sed non lacus eget ex dapibus tincidunt non et justo. Aenean in semper ante. Fusce tempus mollis justo, sit amet molestie velit iaculis nec. Praesent est ligula, aliquet sed malesuada non, consequat a erat. Aenean quis mattis lectus.',
  'Nunc enim elit, laoreet eget iaculis ac, dictum nec ex. Morbi accumsan malesuada metus, at dapibus odio commodo in. Vivamus facilisis facilisis nibh, in convallis sem ultricies rutrum. Vivamus faucibus tincidunt libero, eu lacinia leo tincidunt et. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque auctor tincidunt risus, quis pulvinar odio tincidunt vel. Mauris ullamcorper nulla pellentesque interdum luctus. Nullam pulvinar erat eget erat varius, eu sollicitudin orci elementum. Nulla dictum neque a lacus faucibus, nec rutrum lectus vehicula. In mauris libero, ultrices nec consequat at, vestibulum mollis orci. Pellentesque velit nisi, porttitor sit amet nulla eu, rhoncus consectetur dolor. Integer dictum, arcu vitae interdum interdum, sem sapien gravida magna, et semper felis tortor eget nunc. Aliquam consequat ornare sem, tincidunt finibus turpis porta et. Sed nunc dui, consequat id bibendum sed, volutpat non eros. Nam elementum pulvinar quam eget ultrices.',
  'Nulla nec magna non enim lacinia pharetra a sed nisi. Cras eu hendrerit lacus. Morbi eget est metus. Donec dui erat, porta vitae tempus in, tempor eu libero. Sed at semper eros, eget dictum neque. Donec molestie tristique lacinia. Suspendisse risus elit, pharetra et dapibus a, venenatis at ex. Praesent quam elit, auctor id porttitor id, fermentum et dui. Ut ac lacinia sapien. Vivamus luctus maximus felis hendrerit ornare. Donec ornare massa velit, ac interdum magna finibus consequat. Etiam nunc eros, congue eget aliquam ac, iaculis ac magna. Vivamus sit amet ligula id nisl malesuada pretium.',
  'Quisque sed mollis enim. Curabitur non dignissim justo. Ut velit nulla, volutpat vel risus quis, facilisis blandit diam. Pellentesque leo sem, mattis sed mattis eget, ornare eget ipsum. Phasellus at tortor ut felis fringilla condimentum. Fusce sed libero a mauris sagittis blandit. Pellentesque sit amet orci maximus, tincidunt velit vel, volutpat nibh. Cras egestas eget nisi sed ullamcorper. Aliquam faucibus nisl eget fermentum dapibus. Vestibulum ac congue tortor.',
  'Mauris urna nisl, cursus ut leo eget, blandit vulputate tortor. Nam ultricies gravida tellus, non luctus nulla eleifend eget. Nam quis quam id magna porttitor faucibus ac blandit risus. Mauris est purus, bibendum ut risus a, condimentum pellentesque lorem. Aliquam ultrices mauris erat, vitae tempor felis suscipit posuere. Nulla convallis nisl non semper malesuada. Quisque varius pharetra arcu id vulputate. Quisque diam eros, sodales vitae mattis malesuada, commodo non tortor. Nam at suscipit metus. Vestibulum tempus commodo tincidunt. Aenean tincidunt ac ex at pharetra. Proin euismod sem eu nulla vestibulum varius. Suspendisse rhoncus faucibus diam id faucibus.',
  'Nam gravida elit et sapien pharetra venenatis. Quisque et nibh elementum mi iaculis imperdiet vitae vitae velit. Pellentesque congue lacinia libero non cursus. Praesent pellentesque mi eget nulla facilisis efficitur. Duis laoreet risus non volutpat mattis. Ut ac cursus nibh. Curabitur euismod leo a ullamcorper egestas. Aenean eget nisl mattis, posuere odio eget, placerat leo.'
]
