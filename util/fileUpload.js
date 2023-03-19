const multer = require("multer");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.fieldname )
    }
  })
  


  function fileFilter (req, file, cb) {

    if(file.mimetype === "image/png" 
    ||file.mimetype === "image/jpg" 
    || file.mimetype === "image/jpeg"  ){
       
           cb(null, true)
    }else{
        cb(null, false)

    }  
  };

//   Filesize formater

  const fileSizeFormater = (bytes,decimal) => {
      if(bytes === 0){
        return "0 bytes"
      };
      const dm = decimal || 2;
      const sizes = ["Bytes", "KB", "MB" , "TB", "GB", "PB", "EB", "YB", "ZB"];
      const index = Math.floor(Math.log(bytes)/ Math.log(1000));
      return (
        parseFloat((bytes/Math.pow(1000/index)).toFixed(dm)) + " " + sizes[index]
      )
  }

  const upload = multer({ storage,fileFilter });


  module.exports = {upload,fileSizeFormater}


