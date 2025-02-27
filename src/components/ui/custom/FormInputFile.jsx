import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormInputFile = (props) => {
  const { accept, placeholder, form } = props;

  const fileRef = form.register("file");

  return (
    <FormControl>
      <Input
        type="file"
        accept={accept}
        placeholder={placeholder}
        {...fileRef}
      />
    </FormControl>
  );
};

export default FormInputFile;
