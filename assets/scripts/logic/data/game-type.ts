import { _decorator, Component, Node, Label, Sprite, Button, EditBox, Toggle, Slider } from 'cc';
import { FilSmooth } from '../../core/ui/fil-smooth';
const { ccclass, property } = _decorator;


export type type_x_y = {
    x: number,
    y: number,
}

export type KeyAnyType = {
    [key:string]:any;
}

export type ComponentTypes = 
{ new () : Label } | 
{ new () : Sprite } | 
{ new () : EditBox } | 
{ new () : Toggle } |
{ new () : Slider } |
{ new () : FilSmooth }