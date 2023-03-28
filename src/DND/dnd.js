import React, { Component, createRef } from "react";
//import { reduxForm } from 'redux-form';

//import FieldMaker from './FieldMaker';
//import ButtonMaker from './ButtonMaker';

import Button from "@mui/material/Button";

//import React, { Component, createRef } from "react";
import Avatar from "@mui/material/Avatar";
import CloseIcon from "@mui/material/Close";
import ErrorIcon from "@material-ui/icons/Error";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import FormControl from "@mui/material/core/FormControl";

//import RenderDragDrop from './RenderDragDrop';
import "./dnd.scss";

const imageMimeTypes = [
  "image/webp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp"
];
const pdfMimeTypes = ["application/pdf"];
const isFileImage = (file) => {
  return file && imageMimeTypes.includes(file["type"]);
};
const isFilePdf = (file) => {
  return file && pdfMimeTypes.includes(file["type"]);
};

const isWithinFileLimit = (file, fileLimit) => {
  return file.size <= fileLimit;
};
/*
const FormShell = props => {
  const { handleSubmit, pristine, reset, previousPage, submitting } = props

  console.log("THIS FORM SHELL PROPS", props);
  return (
    <form onSubmit={handleSubmit}>
      <FieldMaker fields={props.fields} hasButtons={props.buttons.length > 0? true: false} />
      <ButtonMaker buttons={props.buttons} pristine={pristine} submitting={submitting} reset={reset} previousPage={previousPage} />
    </form>
  )
}
*/

/*
let reduxFormHandler = {
  //form: 'syncValidationForm'+uuid(), // a unique identifier for this form
  //validate, // <--- validation function given to redux-form
  //warn, // <--- warning function given to redux-form
}
*/

//console.log("reduxFormHandler", reduxFormHandler); //reduxFormHandler

class DragAndDropForm extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      dropArea: createRef(),
      gallery: [],
      erroredFiles: [],
      selectedFiles: [],
      isHighlighted: false
    };

    this.fieldChanged = this.fieldChanged.bind(this);
    this.highlight = this.highlight.bind(this);
    this.unhighlight = this.unhighlight.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  fieldChanged(field, value) {
    //if it doesn't have any submit buttons -- then submit the form on change of fields
    if (!this.props.buttons.length > 0) {
      //console.log("submit the form as a buttonless form");
      setTimeout(() => {
        this.props.submitHandler();
      }, 1);
    }
  }

  isDisabled() {
    let bool = false;
    return bool;
  }

  uploadFiles = () => {
    const { selectedFiles } = this.state;
    let formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file));

    let data = {
      dragDrop: selectedFiles
    };
    //this.props.submitHandler(this.props.input.name, selectedFiles);

    this.props.submitHandler(data);

    this.setState({
      gallery: [],
      erroredFiles: [],
      selectedFiles: [],
      isHighlighted: false
    });
  };

  componentDidUpdate(prevProps, prevState) {
    const prevSelectedFiles = prevState.selectedFiles;
    const nextSelectedFiles = this.state.selectedFiles;
    if (prevSelectedFiles.length !== nextSelectedFiles.length) {
      this.previewFiles();
    }
  }

  handleFiles(files) {
    const localFiles = [];
    const erroredFiles = [];
    Array.from(files).forEach((file) => {
      const imageInstance = isFileImage(file);
      const pdfInstance = isFilePdf(file);
      if (!imageInstance && !pdfInstance) {
        erroredFiles.push({
          reason: "Format not supported",
          name: file.name,
          size: file.size
        });
        return null;
      }
      const fileLimit = this.props.fileLimit || 11148112;
      const allowedSize = isWithinFileLimit(file, fileLimit);
      if (!allowedSize) {
        erroredFiles.push({
          reason: "File exceeds allowed limit",
          name: file.name,
          size: file.size
        });
        return null;
      }
      localFiles.push(file);
      return null;
    });

    this.setState((prevState) => ({
      ...prevState,
      selectedFiles: [...prevState.selectedFiles, ...localFiles],
      erroredFiles: [...prevState.erroredFiles, ...erroredFiles]
    }));
  }

  handleDrop(e) {
    this.unhighlight(e);
    let dt = e.dataTransfer;
    let files = dt.files;
    this.handleFiles(files);
  }

  readFileAsPromise(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      try {
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          resolve(reader.result);
        };
      } catch (err) {
        reject(err.message);
      }
    });
  }
  async previewFiles() {
    const { selectedFiles } = this.state;
    const galleryPromises = selectedFiles.map(async (file) => {
      const data = await this.readFileAsPromise(file);
      const isImage = isFileImage(file);
      return {
        path: data,
        name: file.name,
        size: file.size,
        type: isImage ? "image" : "pdf"
      };
    });
    const gallery = await Promise.all(galleryPromises);
    this.setState((prevState) => ({
      ...prevState,
      gallery: [...gallery]
    }));
  }

  handleDeleteErroredFiles(name) {
    const { erroredFiles } = this.state;
    const newSelectedFiles = [...erroredFiles];
    const filteredFiles = newSelectedFiles.filter((file) => file.name !== name);
    this.setState((prevState) => ({
      ...prevState,
      erroredFiles: [...filteredFiles]
    }));
  }

  handleDeleteFiles(name) {
    const { selectedFiles, gallery } = this.state;
    const newSelectedFiles = [...selectedFiles];
    const newGallery = [...gallery];
    const filteredFiles = newSelectedFiles.filter((file) => file.name !== name);
    const filteredGallery = newGallery.filter((item) => item.name !== name);
    this.setState((prevState) => ({
      ...prevState,
      selectedFiles: [...filteredFiles],
      gallery: [...filteredGallery]
    }));
  }
  highlight(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isHighlighted: true });
  }

  unhighlight(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isHighlighted: false });
  }

  render() {
    //const { handleSubmit } = this.props
    //onSubmit={handleSubmit}
    //console.log("THIS AUTOFORM SHELL PROPS", this.props);
    return (
      <form>
        {/*
      <RenderDragDrop 
        onHandle={this.fieldChanged}
      />*/}

        <FormControl component="fieldset" fullWidth={true}>
          <div>
            <div
              onDrageEnter={this.highlight}
              onDragOver={this.highlight}
              onDragLeave={this.unhighlight}
              onDrop={this.handleDrop}
              ref={this.state.dropArea}
              className="dragndrop padded-zone"
            >
              <div
                className={
                  "drop-area " + (this.state.isHighlighted ? "highlight" : "")
                }
              >
                {!this.state.isHighlighted && (
                  <div className="drop-zone">
                    <p>
                      Drag and drop files of{" "}
                      <span className="highlight-select">
                        <br />
                        PDF or Images
                      </span>
                    </p>
                  </div>
                )}
                {this.state.isHighlighted && (
                  <div className="drop-zone">
                    <p className="white">Drop your files here</p>
                  </div>
                )}

                <input
                  type="file"
                  id="fileElem"
                  multiple
                  accept="image/*"
                  onChange={(e) => this.handleFiles(e.target.files)}
                />
                {!this.state.isHighlighted && (
                  <label className="button" for="fileElem">
                    Or{" "}
                    <span className="highlight-select underline">
                      {" "}
                      browse files{" "}
                    </span>
                    from your computer
                  </label>
                )}
              </div>
            </div>

            <div className="preview-container">
              {this.state.erroredFiles.map((img, index) => (
                <div key={index} className="preview-row">
                  <Avatar variant="square" className="img">
                    <ErrorIcon />
                  </Avatar>
                  <div className="details-column">
                    <h3>{img.reason}</h3>
                    <span>
                      Files size: <strong>{img.size} Bytes </strong>
                    </span>
                  </div>
                  <CloseIcon
                    onClick={() => this.handleDeleteErroredFiles(img.name)}
                    className="close-icon"
                  />
                </div>
              ))}
              {this.state.gallery.map((img, index) => (
                <div key={index} className="preview-row">
                  {img.type === "image" ? (
                    <img className="img" alt="selected" src={img.path} />
                  ) : (
                    <Avatar variant="square" className="img">
                      <FileCopyIcon />
                    </Avatar>
                  )}

                  <div className="details-column">
                    <h3>{img.name}</h3>
                    <span>{img.size} Bytes</span>
                  </div>
                  <CloseIcon
                    onClick={() => this.handleDeleteFiles(img.name)}
                    className="close-icon"
                  />
                </div>
              ))}
            </div>

            {this.state.gallery.length > 0 && (
              <div className="upload-row">
                <button onClick={this.uploadFiles}> Upload </button>
              </div>
            )}
          </div>
        </FormControl>

        <Button
          variant={this.props.buttons[0].variant}
          color={this.props.buttons[0].color}
          disabled={this.isDisabled()}
          onClick={this.props.submitHandler}
        >
          {this.props.buttons[0].label}
        </Button>
      </form>
    );
  }
}

export default DragAndDropForm;
