/** React Native FormData file payload (uri/name/type). */
export type RNFormDataFile = {
  uri: string;
  name: string;
  type: string;
};

export function appendFormDataFile(
  formData: FormData,
  field: string,
  file: RNFormDataFile,
): void {
  formData.append(field, file as unknown as Blob);
}
