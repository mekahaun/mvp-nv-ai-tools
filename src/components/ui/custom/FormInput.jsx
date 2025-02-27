import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormInput = (props) => {
  const { placeholder, field } = props;
  return (
    <FormControl>
      <Input className='font-medium' placeholder={placeholder} {...field} />
    </FormControl>
  );
};

export default FormInput;
