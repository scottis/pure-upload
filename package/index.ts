export function addEventHandler(
  el: Element | HTMLElement,
  event: string,
  handler: EventListenerOrEventListenerObject
) {
  if (el.addEventListener) {
    el.addEventListener(event, handler);
  } else {
    let elem = <IElementWithEvents>el;
    if (elem.attachEvent) {
      elem.attachEvent("on" + event, handler as EventListener);
    } else {
      elem[event] = handler;
    }
  }
}

interface IElementWithEvents extends HTMLElement {
  [key: string]: Function | Object | string | void | null | number | boolean;
  attachEvent: (event: string, handler: (ev: UIEvent) => void) => void;
}

export const isFileApi: boolean = !!(
  (<{ File?: Object }>window).File && (<{ FormData?: Object }>window).FormData
);

export function castFiles(
  fileList: File[] | Object,
  status?: UploadStatus
): IUploadFile[] {
  let files: IUploadFile[];

  if (typeof fileList === "object") {
    files = Object.keys(fileList)
      .filter(key => key !== "length")
      .map(key => (<IFileOrObjectWithIndexer>fileList)[key]);
  } else {
    files = <IUploadFile[]>fileList;
  }

  files.forEach((file: IUploadFile) => {
    file.uploadStatus = status || file.uploadStatus;
    file.responseCode = file.responseCode || 0;
    file.responseText = file.responseText || "";
    file.progress = file.progress || 0;
    file.sentBytes = file.sentBytes || 0;
    file.cancel =
      file.cancel ||
      (() => {
        return;
      });
  });

  return files;
}

interface IFileOrObjectWithIndexer {
  [key: string]: IUploadFile;
}

export function decorateSimpleFunction(
  origFn: () => void,
  newFn: () => void,
  newFirst: boolean = false
): () => void {
  if (!origFn) return newFn;

  return newFirst
    ? () => {
        newFn();
        origFn();
      }
    : () => {
        origFn();
        newFn();
      };
}

function applyDefaults<T, S>(target: T, source: S): T & S {
  let to = Object(target);

  for (let nextKey in source) {
    if (
      Object.prototype.hasOwnProperty.call(source, nextKey) &&
      (to[nextKey] === undefined || to[nextKey] === null)
    ) {
      to[nextKey] = source[nextKey];
    }
  }
  return to;
}

export function getUploadCore(
  options: IUploadOptions,
  callbacks: IUploadCallbacks
): UploadCore {
  return new UploadCore(options, callbacks);
}

export function getUploader(
  options: IUploadQueueOptions,
  callbacks: IUploadQueueCallbacks
): Uploader {
  return new Uploader(options, callbacks);
}

export function getValueOrResult<T>(valueOrGetter?: T | (() => T)): T | undefined {
  if (isGetter(valueOrGetter)) return valueOrGetter();

  return valueOrGetter;
}

function isGetter<T>(
  valueOrGetter?: T | (() => T)
): valueOrGetter is (() => T) {
  return typeof valueOrGetter === "function";
}

export function newGuid(): string {
  let d = new Date().getTime();
  /* cSpell:disable*/
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
    c
  ) {
    /* cSpell:enable*/
    /* tslint:disable */
    let r = ((d + Math.random() * 16) % 16) | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    /* tslint:enable */
  });
  return uuid;
}

export interface IFileExt extends File {
  kind: string;
  webkitGetAsEntry: () => File;
  getAsFile: () => File;
  file: (callback: (file: IFileExt) => void) => void;
  createReader: Function;
  isFile: boolean;
  isDirectory: boolean;
  fullPath: string;
}

export interface IFullUploadAreaOptions extends IUploadAreaOptions {
  maxFileSize: number;
  allowDragDrop: boolean | (() => boolean);
  clickable: boolean | (() => boolean);
  accept: string;
  multiple: boolean;
  validateExtension: boolean;

  localizer: ILocalizer;
}

export interface IFullUploadOptions extends IUploadOptions {
  withCredentials: boolean;
  headers: { [key: string]: string | number | boolean };
  params: { [key: string]: string | number | boolean | Blob };
  localizer: ILocalizer;
}

export interface ILocalizer {
  fileSizeInvalid: (maxFileSize: number) => string;
  fileTypeInvalid: (accept: string) => string;
  invalidResponseFromServer: () => string;
}

function getDefaultLocalizer(): ILocalizer {
  return {
    fileSizeInvalid: maxFileSize =>
      "The selected file exceeds the allowed size of " +
      maxFileSize +
      " or its size is 0 MB. Please choose another file.",
    fileTypeInvalid: accept =>
      "File format is not allowed. Only " +
      (accept ? accept : "") +
      " files are allowed.",
    invalidResponseFromServer: () => "Invalid response from server"
  };
}

export interface IOffsetInfo {
  running: boolean;
  fileCount: number;
}

export interface IUploadAreaOptions extends IUploadOptions {
  maxFileSize?: number;
  allowDragDrop?: boolean | (() => boolean);
  clickable?: boolean | (() => boolean);
  accept?: string;
  multiple?: boolean;
  validateExtension?: boolean;
  manualStart?: boolean;
  allowEmptyFile?: boolean;
  dragOverStyle?: string;
  dragOverGlobalStyle?: string;

  onFileAdded?: (file: IUploadFile) => void;
  onFileSelected?: (file: IUploadFile) => void;
  onFilesSelected?: (file: IUploadFile[]) => void;
  onFileError?: (file: IUploadFile) => void;
  onFileCanceled?: (file: IUploadFile) => void;
}

export interface IUploadCallbacks {
  onProgressCallback?: (file: IUploadFile) => void;
  onCancelledCallback?: (file: IUploadFile) => void;
  onFinishedCallback?: (file: IUploadFile) => void;
  onUploadedCallback?: (file: IUploadFile) => void;
  onErrorCallback?: (file: IUploadFile) => void;
  onUploadStartedCallback?: (file: IUploadFile) => void;
}

export interface IUploadCallbacksExt extends IUploadCallbacks {
  onFileStateChangedCallback?: (file: IUploadFile) => void;
}

export interface IUploadFile extends File {
  guid: string;
  url: string;
  uploadStatus: UploadStatus;
  responseCode: number;
  responseText: string;
  progress: number;
  sentBytes: number;

  cancel: () => void;
  remove: () => void;
  start: () => void;
  onError: (file: IUploadFile) => void;
  onCancel: (file: IUploadFile) => void;
}

export interface IUploadOptions {
  url: string | ((file: IUploadFile) => string);
  method: string;
  withCredentials?: boolean;
  headers?: { [key: string]: string | number | boolean };
  params?: { [key: string]: string | number | boolean | Blob };
  localizer?: ILocalizer;
}

export interface IUploadQueueCallbacks extends IUploadCallbacks {
  onFileAddedCallback?: (file: IUploadFile) => void;
  onFileRemovedCallback?: (file: IUploadFile) => void;
  onAllFinishedCallback?: () => void;
  onQueueChangedCallback?: (queue: IUploadFile[]) => void;
}

export interface IUploadQueueCallbacksExt
  extends IUploadQueueCallbacks,
    IUploadCallbacksExt {}

export interface IUploadQueueOptions {
  maxParallelUploads?: number;
  parallelBatchOffset?: number;
  autoStart?: boolean;
  autoRemove?: boolean;
}

export function removeEventHandler(
  el: HTMLInputElement | Element,
  event: string,
  handler: EventListenerOrEventListenerObject
) {
  if (el.removeEventListener) {
    el.removeEventListener(event, handler);
  } else {
    let elem = <IElementWithDetachEvent>el;
    if (elem.detachEvent) {
      elem.detachEvent("on" + event, handler as EventListener);
    } else {
      elem[event] = null;
    }
  }
}

interface IElementWithDetachEvent extends HTMLElement {
  [key: string]: Function | Object | string | void | null | number | boolean;
  detachEvent: (event: string, handler: (ev: UIEvent) => void) => void;
}

export class UploadArea {
  public targetElement: HTMLElement;
  public uploader: Uploader;
  public options: IFullUploadAreaOptions;
  private uploadCore: UploadCore;
  private _fileInput?: HTMLInputElement;
  private fileList?: IUploadFile[] | null;
  private unregisterOnClick?: () => void;
  private unregisterOnDrop?: () => void;
  private unregisterOnDragOver?: () => void;
  private unregisterOnDragLeave?: () => void;
  private unregisterOnDragOverGlobal?: () => void;
  private unregisterOnDragLeaveGlobal?: () => void;
  private unregisterOnChange?: () => void;

  constructor(
    targetElement: HTMLElement,
    options: IUploadAreaOptions,
    uploader: Uploader
  ) {
    this.targetElement = targetElement;
    this.options = applyDefaults(options, this.defaultOptions());
    this.uploader = uploader;
    this.uploadCore = getUploadCore(
      this.options,
      this.uploader.queue.callbacks
    );
    if (isFileApi) {
      this.setupFileApiElements();
    } else {
      throw "Only browsers with FileAPI supported.";
    }
  }

  start(autoClear: boolean = false, files?: IUploadFile[]) {
    if (this.options.manualStart && (files || this.fileList)) {
      this.putFilesToQueue(files);
      if (autoClear) this.clear(files);
    }
  }

  clear(files?: IUploadFile[]) {
    this.fileList =
      this.fileList && files
        ? this.fileList.filter(file => files.indexOf(file) < 0)
        : null;
  }

  destroy(): void {
    if (this.unregisterOnClick) this.unregisterOnClick();

    if (this.unregisterOnDrop) this.unregisterOnDrop();

    if (this.unregisterOnChange) this.unregisterOnChange();

    if (this.unregisterOnDragOver) this.unregisterOnDragOver();

    if (this.unregisterOnDragLeave) this.unregisterOnDragLeave();

    if (this.unregisterOnDragOverGlobal) this.unregisterOnDragOverGlobal();

    if (this.unregisterOnDragLeaveGlobal) this.unregisterOnDragLeaveGlobal();

    if (this._fileInput) document.body.removeChild(this._fileInput);
  }

  get fileInput(): HTMLInputElement | undefined {
    return this._fileInput;
  }

  private defaultOptions() {
    return {
      localizer: getDefaultLocalizer(),
      maxFileSize: 1024,
      allowDragDrop: true,
      clickable: true,
      accept: "*.*",
      validateExtension: false,
      multiple: true,
      allowEmptyFile: false
    };
  }

  private selectFiles(fileList: FileList | File[]) {
    this.fileList = castFiles(fileList);

    if (this.options.onFileSelected)
      this.fileList.forEach((file: IUploadFile) => {
        if (this.options.onFileSelected) this.options.onFileSelected(file);
      });

    if (this.options.onFilesSelected) {
      const files: IUploadFile[] = [];

      this.fileList.forEach((file: IUploadFile) => {
        files.push(file);
      });

      this.options.onFilesSelected(files);
    }

    if (!this.options.manualStart) this.putFilesToQueue();
  }

  private putFilesToQueue(files?: IUploadFile[]): void {
    files =
      this.fileList && files
        ? this.fileList.filter(file => files && files.indexOf(file) >= 0)
        : this.fileList || undefined;

    if (!files) return;

    files.forEach((file: IUploadFile) => {
      file.guid = newGuid();
      delete file.uploadStatus;
      file.url = this.uploadCore.getUrl(file);
      file.onError =
        this.options.onFileError ||
        (() => {
          return;
        });
      file.onCancel =
        this.options.onFileCanceled ||
        (() => {
          return;
        });
      if (this.validateFile(file)) {
        file.start = () => {
          this.uploadCore.upload([file]);

          if (this.options.onFileAdded) {
            this.options.onFileAdded(file);
          }
          file.start = () => {
            return;
          };
        };
      } else {
        file.onError(file);
      }
    });
    this.uploader.queue.addFiles(files);
  }

  private validateFile(file: IUploadFile): boolean {
    if (!this.isFileSizeValid(file)) {
      file.uploadStatus = UploadStatus.failed;
      file.responseText = this.options.localizer.fileSizeInvalid(
        this.options.maxFileSize
      );
      return false;
    }
    if (this.isFileTypeInvalid(file)) {
      file.uploadStatus = UploadStatus.failed;
      file.responseText = this.options.localizer.fileTypeInvalid(
        this.options.accept
      );
      return false;
    }
    return true;
  }

  private setupFileApiElements(): void {
    this._fileInput = document.createElement("input");
    this._fileInput.setAttribute("type", "file");
    this._fileInput.setAttribute(
      "accept",
      this.options.accept ? this.options.accept : ""
    );
    this._fileInput.style.display = "none";

    const onChange = (e: Event) => this.onChange(e);
    addEventHandler(this._fileInput, "change", onChange);
    this.unregisterOnChange = () => {
      if (this._fileInput)
        removeEventHandler(
          this._fileInput,
          "change",
          onchange as EventListener
        );
    };

    if (this.options.multiple) {
      this._fileInput.setAttribute("multiple", "");
    }

    this.registerEvents();

    // attach to body
    document.body.appendChild(this._fileInput);
  }

  private registerEvents() {
    const onClick = () => this.onClick();
    addEventHandler(this.targetElement, "click", onClick);
    this.unregisterOnClick = () =>
      removeEventHandler(this.targetElement, "click", onClick);

    const onDrag = ((e: DragEvent) =>
      this.onDrag(e)) as EventListenerOrEventListenerObject;
    addEventHandler(this.targetElement, "dragover", onDrag);
    this.unregisterOnDragOver = () =>
      removeEventHandler(this.targetElement, "dragover", onDrag);

    const onDragLeave = () => this.onDragLeave();
    addEventHandler(this.targetElement, "dragleave", onDragLeave);
    this.unregisterOnDragOver = () =>
      removeEventHandler(this.targetElement, "dragleave", onDragLeave);

    const onDragGlobal = () => this.onDragGlobal();
    addEventHandler(document.body, "dragover", onDragGlobal);
    this.unregisterOnDragOverGlobal = () =>
      removeEventHandler(document.body, "dragover", onDragGlobal);

    const onDragLeaveGlobal = () => this.onDragLeaveGlobal();
    addEventHandler(document.body, "dragleave", onDragLeaveGlobal);
    this.unregisterOnDragOverGlobal = () =>
      removeEventHandler(document.body, "dragleave", onDragLeaveGlobal);

    const onDrop = ((e: DragEvent) =>
      this.onDrop(e)) as EventListenerOrEventListenerObject;
    addEventHandler(this.targetElement, "drop", onDrop);
    this.unregisterOnDrop = () =>
      removeEventHandler(this.targetElement, "drop", onDrop);
  }

  private onChange(e: Event): void {
    this.selectFiles(<FileList>(<HTMLInputElement>e.target).files);
  }

  private onDrag(e: DragEvent): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.addDragOverStyle(this.options.dragOverStyle);
    let effect: string | undefined = undefined;
    if (e.dataTransfer) {
      try {
        effect = e.dataTransfer.effectAllowed;
      } catch {
        true;
      }
      e.dataTransfer.dropEffect =
        "move" === effect || "linkMove" === effect ? "move" : "copy";
    }
    this.stopEventPropagation(e);
  }

  private onDragLeave(): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.removeDragOverStyle(this.options.dragOverStyle);
  }

  private onDragGlobal(): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.addDragOverStyle(this.options.dragOverGlobalStyle);
  }

  private onDragLeaveGlobal(): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.removeDragOverStyle(this.options.dragOverGlobalStyle);
  }

  private removeDragOverStyle(style?: string) {
    if (!style) return;

    this.targetElement.classList.remove(style);
  }

  private addDragOverStyle(style?: string) {
    if (!style) return;

    this.targetElement.classList.add(style);
  }

  private onDrop(e: DragEvent): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.stopEventPropagation(e);
    if (!e.dataTransfer) {
      return;
    }

    this.removeDragOverStyle(this.options.dragOverStyle);

    let files: FileList | File[] = e.dataTransfer.files;
    if (files.length) {
      if (!this.options.multiple) files = [files[0]];

      let items = e.dataTransfer.items;
      if (
        items &&
        items.length &&
        (<{ webkitGetAsEntry?: Object }>items[0]).webkitGetAsEntry !== null
      ) {
        if (!this.options.multiple) {
          let newItems = [items[0]];
          this.addFilesFromItems(newItems);
        } else {
          this.addFilesFromItems(items);
        }
      } else {
        this.selectFiles(files);
      }
    }
  }

  private isIeVersion(v: number): boolean {
    return RegExp("msie" + (!isNaN(v) ? "\\s" + v.toString() : ""), "i").test(
      navigator.userAgent
    );
  }

  private onClick(): void {
    if (!getValueOrResult(this.options.clickable) || !this._fileInput) return;

    this._fileInput.value = "";

    if (this.isIeVersion(10)) {
      setTimeout(() => {
        if (this._fileInput) this._fileInput.click();
      }, 200);
    } else {
      this._fileInput.click();
    }
  }

  private addFilesFromItems(
    items: FileList | File[] | DataTransferItemList | DataTransferItem[]
  ): void {
    let entry: IFileExt;
    let addedItemsCount = 0;
    let addedFiles: File[] = [];
    let itemsCount = items.length;
    for (let i = 0; i < itemsCount; i++) {
      let item: IFileExt = <IFileExt>items[i];
      if (
        item.webkitGetAsEntry &&
        (entry = <IFileExt>item.webkitGetAsEntry())
      ) {
        if (entry.isFile) {
          ++addedItemsCount;
          addedFiles.push(item.getAsFile());
          if (addedItemsCount === itemsCount) this.selectFiles(addedFiles);
        } else if (entry.isDirectory) {
          this.processDirectory(entry, entry.name, (files) => {
            ++addedItemsCount;
            addedFiles.push.apply(addedFiles, files);
            if (addedItemsCount === itemsCount) this.selectFiles(addedFiles);
          });
        }
      } else if (item.getAsFile) {
        if (!item.kind || item.kind === "file") {
          ++addedItemsCount;
          addedFiles.push(item.getAsFile());
          if (addedItemsCount === itemsCount) this.selectFiles(addedFiles);
        }
      }
    }
  }

  private processDirectory(
    directory: { createReader: Function },
    path: string,
    callback: (files: File[]) => void
  ): void {
    let dirReader = directory.createReader();
    let processedEntriesCount = 0;
    let processedFiles: File[] = [];
    let self = this;
    let entryReader = (entries: (IFileExt & { createReader: Function })[]) => {
      for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        if (entry.isFile) {
          entry.file((file: IFileExt) => {
            if (file.name.substring(0, 1) === ".") {
              return;
            }
            file.fullPath = "" + path + "/" + file.name;
            processedFiles.push(file);
            ++processedEntriesCount;
            if (processedEntriesCount === entries.length) callback(processedFiles);
          });
        } else if (entry.isDirectory) {
          self.processDirectory(entry, "" + path + "/" + entry.name, (files) => {
            ++processedEntriesCount;
            processedFiles.push.apply(processedFiles, files);
            if (processedEntriesCount === entries.length) callback(processedFiles);
          });
        }
      }
    };
    dirReader.readEntries(entryReader, function(error: string) {
      return typeof console !== "undefined" && console !== null
        ? typeof console.log === "function"
          ? console.log(error)
          : void 0
        : void 0;
    });
  }

  private isFileSizeValid(file: File): boolean {
    let maxFileSize = this.options.maxFileSize * 1024 * 1024; // max file size in bytes
    if (
      file.size > maxFileSize ||
      (!this.options.allowEmptyFile && file.size === 0)
    )
      return false;
    return true;
  }

  private isFileTypeInvalid(file: File): boolean {
    if (
      file.name &&
      this.options.accept &&
      (this.options.accept.trim() !== "*" ||
        this.options.accept.trim() !== "*.*") &&
      this.options.validateExtension &&
      this.options.accept.indexOf("/") === -1
    ) {
      let acceptedExtensions = this.options.accept.split(",");
      let fileExtension = file.name.substring(
        file.name.lastIndexOf("."),
        file.name.length
      );
      if (fileExtension.indexOf(".") === -1) return true;
      let isFileExtensionExisted = true;
      for (let i = 0; i < acceptedExtensions.length; i++) {
        if (
          acceptedExtensions[i].toUpperCase().trim() ===
          fileExtension.toUpperCase()
        ) {
          isFileExtensionExisted = false;
        }
      }
      return isFileExtensionExisted;
    }
    return false;
  }

  private stopEventPropagation(e: Event) {
    e.stopPropagation();
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }
}

export class UploadCore {
  public options: IFullUploadOptions;
  public callbacks: IUploadCallbacksExt;

  constructor(options: IUploadOptions, callbacks: IUploadCallbacksExt = {}) {
    this.callbacks = callbacks;
    this.options = applyDefaults(options, this.getDefaultOptions());
    this.setFullCallbacks(callbacks);
  }

  upload(fileList: File[] | Object): void {
    if (!isFileApi) return;
    let files = castFiles(fileList, UploadStatus.uploading);
    files.forEach((file: IUploadFile) => this.processFile(file));
  }

  getUrl(file: IUploadFile): string {
    return typeof this.options.url === "function"
      ? (<(file: IUploadFile) => string>this.options.url)(file)
      : <string>this.options.url;
  }

  private processFile(file: IUploadFile): void {
    let xhr = this.createRequest(file);
    this.setCallbacks(xhr, file);
    this.send(xhr, file);
  }

  private createRequest(file: IUploadFile): XMLHttpRequest {
    let xhr = new XMLHttpRequest();
    let url = file.url || this.getUrl(file);
    xhr.open(this.options.method, url, true);

    xhr.withCredentials = !!this.options.withCredentials;
    this.setHeaders(xhr);
    return xhr;
  }

  private setHeaders(xhr: XMLHttpRequest) {
    if (!this.options.headers) return;

    if (!this.options.headers["Accept"])
      xhr.setRequestHeader("Accept", "application/json");
    if (!this.options.headers["Cache-Control"])
      xhr.setRequestHeader("Cache-Control", "no-cache");
    if (!this.options.headers["X-Requested-With"])
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    Object.keys(this.options.headers).forEach((headerName: string) => {
      if (!this.options.headers) return;
      let headerValue = this.options.headers[headerName];
      if (headerValue !== undefined && headerValue !== null)
        xhr.setRequestHeader(headerName, (headerValue || "").toString());
    });
  }

  private setCallbacks(xhr: XMLHttpRequest, file: IUploadFile) {
    file.cancel = decorateSimpleFunction(
      file.cancel,
      () => {
        xhr.abort();
        file.uploadStatus = UploadStatus.canceled;
        if (file.onCancel) file.onCancel(file);
        if (this.callbacks.onCancelledCallback)
          this.callbacks.onCancelledCallback(file);

        if (this.callbacks.onFileStateChangedCallback)
          this.callbacks.onFileStateChangedCallback(file);

        if (this.callbacks.onFinishedCallback)
          this.callbacks.onFinishedCallback(file);
      },
      true
    );

    xhr.onload = () => this.onload(file, xhr);
    xhr.onerror = () => this.handleError(file, xhr);
    xhr.upload.onprogress = (e: ProgressEvent) => this.updateProgress(file, e);
  }

  private send(xhr: XMLHttpRequest, file: IUploadFile) {
    let formData = this.createFormData(file);
    if (this.callbacks.onUploadStartedCallback)
      this.callbacks.onUploadStartedCallback(file);

    if (this.callbacks.onFileStateChangedCallback)
      this.callbacks.onFileStateChangedCallback(file);
    xhr.send(formData);
  }

  private createFormData(file: IUploadFile): FormData {
    let formData = new FormData();
    if (this.options.params) {
      Object.keys(this.options.params).forEach((paramName: string) => {
        if (!this.options.params) return;
        let paramValue = this.options.params[paramName];
        if (paramValue !== undefined && paramValue !== null)
          formData.append(paramName, this.castParamType(paramValue));
      });
    }

    formData.append("file", file, file.name);
    return formData;
  }

  private castParamType(
    param: string | number | boolean | Blob
  ): string | Blob {
    return this.isBoolean(param) || this.isNumber(param)
      ? param.toString()
      : param;
  }

  private isNumber(param: string | number | boolean | Blob): param is number {
    return typeof param === "number";
  }

  private isBoolean(param: string | number | boolean | Blob): param is boolean {
    return typeof param === "number";
  }

  private handleError(file: IUploadFile, xhr: XMLHttpRequest): void {
    file.uploadStatus = UploadStatus.failed;
    this.setResponse(file, xhr);
    if (file.onError) {
      file.onError(file);
    }

    if (this.callbacks.onErrorCallback) this.callbacks.onErrorCallback(file);
    if (this.callbacks.onFileStateChangedCallback)
      this.callbacks.onFileStateChangedCallback(file);
    if (this.callbacks.onFinishedCallback)
      this.callbacks.onFinishedCallback(file);
  }

  private updateProgress(file: IUploadFile, e?: ProgressEvent) {
    if (e) {
      if (e.lengthComputable) {
        file.progress = Math.round(100 * (e.loaded / e.total));
        file.sentBytes = e.loaded;
      } else {
        file.progress = 0;
        file.sentBytes = 0;
      }
    } else {
      file.progress = 100;
      file.sentBytes = file.size;
    }

    if (this.callbacks.onProgressCallback)
      this.callbacks.onProgressCallback(file);
  }

  private onload(file: IUploadFile, xhr: XMLHttpRequest) {
    if (xhr.readyState !== 4) return;

    if (file.progress !== 100) this.updateProgress(file);

    if (xhr.status === 200) {
      this.finished(file, xhr);
    } else {
      this.handleError(file, xhr);
    }
  }

  private finished(file: IUploadFile, xhr: XMLHttpRequest) {
    file.uploadStatus = UploadStatus.uploaded;
    this.setResponse(file, xhr);

    if (this.callbacks.onUploadedCallback)
      this.callbacks.onUploadedCallback(file);
    if (this.callbacks.onFileStateChangedCallback)
      this.callbacks.onFileStateChangedCallback(file);
    if (this.callbacks.onFinishedCallback)
      this.callbacks.onFinishedCallback(file);
  }

  private setResponse(file: IUploadFile, xhr: XMLHttpRequest) {
    file.responseCode = xhr.status;
    file.responseText =
      xhr.responseText ||
      xhr.statusText ||
      (xhr.status
        ? xhr.status.toString()
        : "" || this.options.localizer.invalidResponseFromServer());
  }

  private getDefaultOptions(): IFullUploadOptions {
    return {
      headers: {},
      params: {},
      withCredentials: false,
      localizer: getDefaultLocalizer()
    } as IFullUploadOptions;
  }

  private setFullCallbacks(callbacks: IUploadCallbacksExt) {
    this.callbacks.onProgressCallback =
      callbacks.onProgressCallback ||
      (() => {
        return;
      });
    this.callbacks.onCancelledCallback =
      callbacks.onCancelledCallback ||
      (() => {
        return;
      });
    this.callbacks.onFinishedCallback =
      callbacks.onFinishedCallback ||
      (() => {
        return;
      });
    this.callbacks.onUploadedCallback =
      callbacks.onUploadedCallback ||
      (() => {
        return;
      });
    this.callbacks.onErrorCallback =
      callbacks.onErrorCallback ||
      (() => {
        return;
      });
    this.callbacks.onUploadStartedCallback =
      callbacks.onUploadStartedCallback ||
      (() => {
        return;
      });
    this.callbacks.onFileStateChangedCallback =
      callbacks.onFileStateChangedCallback ||
      (() => {
        return;
      });
  }
}

export class Uploader {
  uploadAreas: UploadArea[];
  queue: UploadQueue;
  options: IUploadQueueOptions;

  constructor(
    options: IUploadQueueOptions = {},
    callbacks: IUploadQueueCallbacks = {}
  ) {
    this.options = options;
    this.uploadAreas = [];
    this.queue = new UploadQueue(options, callbacks);
  }

  registerArea(element: HTMLElement, options: IUploadAreaOptions): UploadArea {
    const uploadArea = new UploadArea(element, options, this);
    this.uploadAreas.push(uploadArea);
    return uploadArea;
  }

  unregisterArea(area: UploadArea): void {
    const areaIndex = this.uploadAreas.indexOf(area);
    if (areaIndex >= 0) {
      this.uploadAreas[areaIndex].destroy();
      this.uploadAreas.splice(areaIndex, 1);
    }
  }

  get firstUploadArea(): UploadArea | undefined {
    return this.uploadAreas[0];
  }
}

export class UploadQueue {
  offset: IOffsetInfo = { fileCount: 0, running: false };
  options: IUploadQueueOptions;
  callbacks: IUploadQueueCallbacksExt;
  queuedFiles: IUploadFile[] = [];

  constructor(
    options: IUploadQueueOptions,
    callbacks: IUploadQueueCallbacksExt
  ) {
    this.options = options;
    this.callbacks = callbacks;
    this.setFullOptions();
    this.setFullCallbacks();
  }

  addFiles(files: IUploadFile[]): void {
    files.forEach(file => {
      if (
        !this.queuedFiles.some(
          queuedFile =>
            queuedFile === file ||
            (!!queuedFile.guid && queuedFile.guid === file.guid)
        )
      ) {
        this.queuedFiles.push(file);

        file.remove = decorateSimpleFunction(file.remove, () => {
          this.removeFile(file);
        });
      }

      if (this.callbacks.onFileAddedCallback)
        this.callbacks.onFileAddedCallback(file);

      if (file.uploadStatus === UploadStatus.failed) {
        if (this.callbacks.onErrorCallback) {
          this.callbacks.onErrorCallback(file);
        }
      } else {
        file.uploadStatus = UploadStatus.queued;
      }
    });

    this.filesChanged();
  }

  removeFile(file: IUploadFile, blockRecursive: boolean = false) {
    let index = this.queuedFiles.indexOf(file);

    if (index < 0) return;

    this.deactivateFile(file);
    this.queuedFiles.splice(index, 1);

    if (this.callbacks.onFileRemovedCallback)
      this.callbacks.onFileRemovedCallback(file);

    if (!blockRecursive) this.filesChanged();
  }

  clearFiles(
    excludeStatuses: UploadStatus[] = [],
    cancelProcessing: boolean = false
  ) {
    if (!cancelProcessing)
      excludeStatuses = excludeStatuses.concat([
        UploadStatus.queued,
        UploadStatus.uploading
      ]);

    this.queuedFiles
      .filter(
        (file: IUploadFile) => excludeStatuses.indexOf(file.uploadStatus) < 0
      )
      .forEach(file => this.removeFile(file, true));

    if (this.callbacks.onQueueChangedCallback)
      this.callbacks.onQueueChangedCallback(this.queuedFiles);
  }

  private filesChanged(): void {
    if (this.options.autoRemove) this.removeFinishedFiles();

    if (this.options.autoStart) this.startWaitingFiles();

    if (this.callbacks.onQueueChangedCallback)
      this.callbacks.onQueueChangedCallback(this.queuedFiles);

    this.checkAllFinished();
  }

  private checkAllFinished(): void {
    const unfinishedFiles = this.queuedFiles.filter(
      file =>
        [UploadStatus.queued, UploadStatus.uploading].indexOf(
          file.uploadStatus
        ) >= 0
    );

    if (unfinishedFiles.length === 0 && this.callbacks.onAllFinishedCallback) {
      this.callbacks.onAllFinishedCallback();
    }
  }

  private setFullOptions(): void {
    this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
    this.options.parallelBatchOffset = this.options.parallelBatchOffset || 0;
    this.options.autoStart = isFileApi && (this.options.autoStart || false);
    this.options.autoRemove = this.options.autoRemove || false;
  }

  private setFullCallbacks(): void {
    this.callbacks.onFileAddedCallback =
      this.callbacks.onFileAddedCallback ||
      (() => {
        return;
      });
    this.callbacks.onFileRemovedCallback =
      this.callbacks.onFileRemovedCallback ||
      (() => {
        return;
      });
    this.callbacks.onAllFinishedCallback =
      this.callbacks.onAllFinishedCallback ||
      (() => {
        return;
      });
    this.callbacks.onQueueChangedCallback =
      this.callbacks.onQueueChangedCallback ||
      (() => {
        return;
      });

    this.callbacks.onFileStateChangedCallback = () => this.filesChanged();
  }

  private startWaitingFiles(): void {
    this.getWaitingFiles().forEach(file => file.start());
  }

  private removeFinishedFiles(): void {
    this.queuedFiles
      .filter(
        file =>
          [UploadStatus.uploaded, UploadStatus.canceled].indexOf(
            file.uploadStatus
          ) >= 0
      )
      .forEach(file => this.removeFile(file, true));
  }

  private deactivateFile(file: IUploadFile) {
    if (file.uploadStatus === UploadStatus.uploading) file.cancel();

    file.uploadStatus = UploadStatus.removed;
    file.cancel = () => {
      return;
    };
    file.remove = () => {
      return;
    };
    file.start = () => {
      return;
    };
  }

  private getWaitingFiles() {
    if (!this.options.autoStart) return [];

    let result = this.queuedFiles.filter(
      file => file.uploadStatus === UploadStatus.queued
    );

    if (this.options.maxParallelUploads) {
      const uploadingFilesCount = this.queuedFiles.filter(
        file => file.uploadStatus === UploadStatus.uploading
      ).length;

      let count = Math.min(
        result.length,
        this.options.maxParallelUploads - uploadingFilesCount
      );

      if (count <= 0) {
        return [];
      }

      if (this.options.parallelBatchOffset) {
        if (!this.offset.running) {
          this.startOffset();
        }

        count =
          Math.min(
            this.offset.fileCount + count,
            this.options.maxParallelUploads
          ) - this.offset.fileCount;
        this.offset.fileCount += count;
      }

      result = result.slice(0, count);
    }

    return result;
  }

  private startOffset() {
    this.offset.fileCount = 0;
    this.offset.running = true;

    setTimeout(() => {
      this.offset.fileCount = 0;
      this.offset.running = false;
      this.filesChanged();
    }, this.options.parallelBatchOffset);
  }
}

export enum UploadStatus {
  queued,
  uploading,
  uploaded,
  failed,
  canceled,
  removed
}
