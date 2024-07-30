import { ParsedText } from '../utils/text-parser.service';
import { ParsedImage } from '../utils/image-parser.service';

export type OrderData = ParsedText & ParsedImage;
