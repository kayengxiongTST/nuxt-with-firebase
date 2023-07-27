<template>
    <div>
        <v-card
            :class="{ 'grey lighten-2': dragover }"
            flat
            :color="$vuetify.theme.dark ? `grey darken-3` : `grey lighten-2`"
            @drop.prevent="onDrop($event)"
            @dragover.prevent="dragover = true"
            @dragenter.prevent="dragover = true"
            @dragleave.prevent="dragover = false"
            @click="selectFile"
        >
            <v-card-text>
                <v-row
                    v-if="
                        (!imageUrl && !src) ||
                        (!enableToShowImage && check) ||
                        (!enableToShowImage && !imageUrl)
                    "
                    class="d-flex flex-column"
                    dense
                    align="center"
                    justify="center"
                >
                    <v-icon
                        :class="[dragover ? 'mt-2, mb-6' : 'mt-1']"
                        size="60"
                    >
                        mdi-cloud-upload
                    </v-icon>
                    <div class="grey--text text-center">
                        {{ text ? text : tl('dragAndDropHere') }}
                    </div>
                    <span v-show="label" class="font-weight-regular">{{
                        label
                    }}</span>
                    <span v-show="width !== 0">
                        {{ showTextRecommended ? tl('recommendedSize') : '' }}
                        ({{ `${width} x ${height}` }} {{ tl('pixel') }})
                    </span>
                </v-row>
                <!-- Remove image Button -->
                <div v-else>
                    <v-img
                        v-show="
                            (imageUrl || src) && (enableToShowImage || !check)
                        "
                        :src="imageUrl || src"
                        contain
                        :style="`${size ? 'height: ' + size + 'px' : ''}`"
                    >
                        <v-btn
                            aria-label="remove-image"
                            color="error"
                            icon
                            class="mt-2 ml-2"
                            @click.stop="removeFile()"
                        >
                            <v-icon> mdi-close-circle </v-icon>
                        </v-btn>
                    </v-img>
                </div>
                <v-row
                    v-if="selectImage && imageUrl && enableToShowImage"
                    class="d-flex flex-column mt-3"
                    dense
                    align="center"
                    justify="center"
                >
                    <span class="grey--text">
                        ({{ (selectImage.size / 1000000).toFixed(3) }} MB)
                    </span>
                </v-row>
            </v-card-text>
            <v-card-actions class="d-none">
                <v-file-input
                    v-model="fileImage"
                    accept="image/*"
                    type="file"
                    required
                    :rules="rules"
                    hide-input
                    @change="fileInputChange"
                >
                </v-file-input>
            </v-card-actions>
        </v-card>
        <v-file-input
            ref="uploader"
            v-model="selectedImageData"
            class="d-none"
            type="file"
            @change="onChange"
        />
        <!-- Error validation text -->
        <div
            v-if="(required && !validationError) || !imageUrl"
            class="text-caption"
        >
            <div v-if="imageUrl && !validationError"></div>
            <div
                v-else-if="required"
                :class="warningErrorColor ? 'red--text font-weight-bold' : ''"
            >
                {{ tl('image') }} {{ tl('isRequired') }}
            </div>
        </div>
        <div v-else class="red--text text-caption font-weight-bold">
            {{ validationError !== true ? validationError : null }}
        </div>
    </div>
</template>

<script>
// import base64toblob from 'base64toblob'

export default {
    name: 'ImageUPloadDragDrop',
    props: {
        // eslint-disable-next-line vue/require-prop-types
        image: {
            default: () => {},
        },
        // eslint-disable-next-line vue/require-prop-types
        value: {
            default: () => {},
        },
        // ? This is the showing image, after drop or select the image file
        size: {
            type: String,
            default: null,
        },
        label: {
            type: String,
            default: null,
        },
        // ? Width and height are the expected image size, and showing in recommended size
        width: {
            type: Number,
            default: 0,
        },
        height: {
            type: Number,
            default: 0,
        },
        // ? check is used for checking if the image is matched to the width and height
        check: {
            type: Boolean,
            default: false,
        },
        required: {
            type: Boolean,
            default: true,
        },
        jpgOnly: {
            type: Boolean,
            default: false,
        },
        src: {
            type: String,
            default: null,
        },
        text: {
            type: String,
            default: null,
        },
        showTextRecommended: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            dragover: false,
            uploadedFiles: [],
            selectImage: null,
            imageUrl: null,
            fileImage: null,
            imageIsRequired: false,
            validationError: null,
            warningErrorColor: true,
            enableToShowImage: false,
            // compress image
            file: {},
            result: {},
            reader: {},
            scale: 100,
            quality: 95,
            type: null,
            selectedImageData: null,
        }
    },
    computed: {
        rules() {
            return [
                (v) => {
                    if (!this.required) {
                        return true
                    }
                    if (!v) {
                        this.imageIsRequired = true
                        return this.tl('isRequired')
                    } else {
                        return true
                    }
                },
            ]
        },
    },
    watch: {
        value(value) {
            if (!value) {
                this.imageUrl = null
                this.selectImage = null
            }
        },
        src(val) {
            if (!val) return
            if (val?.includes('undefined') || val?.includes('null')) {
                this.enableToShowImage = false
                return
            }
            this.enableToShowImage = true
        },
    },
    mounted() {
        if (this.src) {
            if (this.src.includes('undefined')) {
                this.enableToShowImage = false
                return
            }
            this.enableToShowImage = true
        }
    },
    methods: {
        removeFile() {
            this.selectedImageData = null
            this.uploadedFiles = []
            this.imageUrl = null
            this.selectImage = null
            this.fileImage = null
            this.warningErrorColor = true
            this.$emit('input', '')

            if (this.src) {
                if (window.confirm(this.tl('areYouSureToDelete'))) {
                    this.enableToShowImage = false
                    this.validationError = true
                }
            }
        },
        onDrop(e, type = 'drag') {
            this.dragover = false
            this.warningErrorColor = true
            const fileType =
                type === 'drag' ? e.dataTransfer.files[0].type : e.type

            const size = type === 'drag' ? e.dataTransfer.files[0].size : e.size

            if (size > 502017 * 2) {
                this.$toast.error(this.tl('imageSizeShouldBeLessThan5Kb'))
                return false
            }

            if (
                this.jpgOnly
                    ? !['image/jpeg', 'image/jpg'].includes(fileType)
                    : !['image/jpeg', 'image/png', 'image/jpg'].includes(
                          fileType
                      )
            ) {
                this.validationError =
                    'Please select only image file, png, jpg, jpeg, webp'
                this.$toast.error(this.tl('acceptOnlyJpegFile'))
                return false
            } else {
                this.validationError = null
            }

            if (type === 'select') {
                this.selectImage = e
                this.$emit('input', e)
                this.onCheckImageSize(e)
            } else {
                // If there are already uploaded files remove them
                if (this.uploadedFiles.length > 0) this.uploadedFiles = []
                // this.selectImage = e.dataTransfer.files[0]
                this.onChange(e.dataTransfer.files[0])
                // this.$emit('input', e.dataTransfer.files[0])
                // this.onCheckImageSize(e.dataTransfer.files[0])
            }
        },
        previewImage() {
            if (this.selectImage) {
                this.imageUrl = URL.createObjectURL(this.selectImage)
            }
        },
        // to browse image file
        selectFile() {
            this.warningErrorColor = true
            if (!this.enableToShowImage) {
                this.selectImage = null
            }
            if (!this.selectImage) {
                this.$refs.uploader.$refs.input.click()
            }
        },
        fileInputChange(e) {
            if (e) {
                this.onDrop(e, 'select')
            }
        },
        onCheckImageSize(imageFile) {
            this.previewImage()
            if (!this.check) return false

            const reader = new FileReader()
            const imgSize = new Image()
            reader.readAsDataURL(imageFile)

            reader.onload = (evt) => {
                imgSize.onload = () => {
                    if (
                        imgSize.height !== this.height &&
                        imgSize.width !== this.width &&
                        this.check
                    ) {
                        this.validationError = `${this.tl(
                            'expectedImageSizeIs'
                        )} ${this.width} x ${this.height} pixel.`

                        this.warningErrorColor = true
                        this.enableToShowImage = false
                        return true
                    } else {
                        this.validationError = null
                        this.enableToShowImage = true
                        return false
                    }
                }
                // Why 5?
                // Since evt.target.result will have value `data:` incase no image got uploaded
                // Without this if condition, it will throw console.error
                // If you wanna know how it works, remove this condition and check your console while uploading
                if (evt.target.result.length > 5) {
                    imgSize.src = evt.target.result
                }
            }
        },
        async getReQualityImage(obj) {
            // if (obj.compressed.size !== '0 kB') {
            const image = await this.getFiles(obj)
            this.selectImage = image
            this.fileImage = image
            this.onCheckImageSize(image)
            this.$emit('input', image)
            // }
        },
        async getFiles(obj) {
            const file = await fetch(obj.compressed.base64)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], obj.compressed.name, {
                        type: this.type,
                    })
                    return file
                })
            return file
        },
        /**
         * Compress image part
         */
        /*
        When Input File has changed
      	*/
        onChange(e) {
            if (!e) return null

            if (e.size > 502017 * 2) {
                this.$toast.error(this.tl('imageSizeShouldBeLessThan5Kb'))
                return false
            }

            const fileType = e.type
            if (
                this.jpgOnly
                    ? !['image/jpeg', 'image/jpg'].includes(fileType)
                    : !['image/jpeg', 'image/png', 'image/jpg'].includes(
                          fileType
                      )
            ) {
                this.validationError =
                    'Please select only image file, png, jpg, jpeg, webp'
                this.$toast.error(this.tl('acceptOnlyJpegFile'))
                return false
            }
            // If There's no file choosen
            const file = e
            if (!file) return false

            // get the file
            this.file = e

            // Validation
            const type = this.file.type
            this.type = type
            const valid = type.includes('image')

            if (!valid)
                // eslint-disable-next-line no-throw-literal
                throw 'File Type Is Not Supported. Upload an image instead'

            // Make new FileReader
            this.reader = new FileReader()

            // Convert the file to base64 text
            this.reader.readAsDataURL(this.file)

            // on reader load somthing...
            this.reader.onload = this.fileOnLoad
            setTimeout(() => {
                this.redraw()
            }, 100)
        },

        /*
        Draw And Compress The Image
        @params {String} imgUrl
		URL: https://www.npmjs.com/package/vue-image-compressor
      */
        async drawImage(imgUrl) {
            // Recreate Canvas Element
            const canvas = await document.createElement('canvas')
            this.canvas = canvas

            // Set Canvas Context
            const ctx = this.canvas.getContext('2d')

            // Create New Image
            const img = new Image()
            img.src = imgUrl

            // Image Size After Scaling
            const scale = this.scale / 100
            const width = img.width * scale
            const height = img.height * scale

            // Set Canvas Height And Width According to Image Size And Scale
            await this.canvas.setAttribute('width', width)
            await this.canvas.setAttribute('height', height)

            ctx.drawImage(img, 0, 0, width, height)

            // Quality Of Image
            const quality = this.quality ? this.quality / 100 : 1

            // If all files have been proceed
            const base64 = await this.canvas.toDataURL(this.type, quality)
            let fileName = this.result.file.name
            const lastDot = fileName.lastIndexOf('.')
            const extension = this.type?.split('/')[1]

            fileName = fileName.substr(0, lastDot) + '.' + extension

            const objToPass = {
                canvas: this.canvas,
                original: this.result,
                compressed: {
                    blob: this.toBlob(base64),
                    base64,
                    name: fileName,
                    file: this.buildFile(base64, fileName),
                },
            }

            objToPass.compressed.size =
                Math.round(objToPass.compressed.file.size / 1000) + ' kB'
            objToPass.compressed.type = this.type
            this.getReQualityImage(objToPass)
        },

        /*
        Redraw the canvas
      */
        redraw() {
            if (this.result.base64) {
                this.drawImage(this.result.base64)
            }
        },

        /*
        When The File in loaded
      */
        fileOnLoad() {
            // The File
            const { file } = this

            // Make a fileInfo Object
            const fileInfo = {
                name: file.name,
                type: file.type,
                size: Math.round(file.size / 1000) + ' kB',
                base64: this.reader.result,
                file,
            }

            // Push it to the state
            this.result = fileInfo

            // DrawImage
            this.drawImage(this.result.base64)
        },

        // Convert Base64 to Blob
        toBlob(imgUrl) {
            const blob = this.$base64toblob(imgUrl.split(',')[1], this.type)
            const url = window.URL.createObjectURL(blob)
            return url
        },

        // Convert Blob To File
        buildFile(blob, name) {
            return new File([blob], name, { type: this.type })
        },
    },
}
</script>
