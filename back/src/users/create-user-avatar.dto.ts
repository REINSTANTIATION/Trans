import { Type } from "class-transformer";
import { IsOptional } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class CreateUserWithAvatarDto extends CreateUserDto {
    @IsOptional()
    @Type(() => Blob)
    avatar?: any;
}
